import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rule-based fallback responses when no OpenAI key is configured
function getRuleBasedResponse(message: string, profile: { fullName: string; title: string; institution: string; email: string } | null): string {
  const msg = message.toLowerCase();

  if (msg.includes("research") || msg.includes("project")) {
    return `${profile?.fullName ?? "The professor"} conducts research in various academic areas. Visit the Research & Projects page to explore current and completed projects in detail.`;
  }
  if (msg.includes("publication") || msg.includes("paper") || msg.includes("article")) {
    return "You can browse all publications on the Publications page. They are sorted by year and can be filtered by type (journal, conference, book, etc.) or searched by keyword.";
  }
  if (msg.includes("course") || msg.includes("teach") || msg.includes("class")) {
    return "Course information including active and archived courses, syllabi, and materials is available on the Teaching & Courses page.";
  }
  if (msg.includes("contact") || msg.includes("email") || msg.includes("reach")) {
    return `You can reach ${profile?.fullName ?? "the professor"} via the Contact page, which includes an email form, office location, office hours, and appointment booking.`;
  }
  if (msg.includes("student") || msg.includes("supervision") || msg.includes("phd") || msg.includes("master")) {
    return "Information about current students and alumni is available on the Students & Supervision page, including research topics and thesis titles.";
  }
  if (msg.includes("cv") || msg.includes("award") || msg.includes("achievement")) {
    return "The CV & Achievements page lists awards, grants, fellowships, and honors. You can also download the full CV as a PDF from there.";
  }
  if (msg.includes("gallery") || msg.includes("photo") || msg.includes("image")) {
    return "The Gallery page contains photos from academic events, conferences, and lab activities, organized by category.";
  }
  if (msg.includes("event") || msg.includes("seminar") || msg.includes("conference") || msg.includes("talk")) {
    return "Upcoming and past events including seminars, workshops, and conference appearances are listed on the Events page.";
  }
  if (msg.includes("blog") || msg.includes("news") || msg.includes("post")) {
    return "The Blog / News & Events page contains academic blog posts and news updates. You can also subscribe to the newsletter for updates.";
  }
  if (msg.includes("collaborat") || msg.includes("partner")) {
    return "Information about research collaborators and partner institutions is on the Collaborations & Resources page. You can also submit a collaboration request from any research project page.";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return `Hello! I'm the assistant for ${profile?.fullName ?? "this professor"}'s website. I can help you find information about research, publications, courses, students, events, and more. What would you like to know?`;
  }
  if (msg.includes("who") || msg.includes("about") || msg.includes("professor")) {
    return `${profile?.fullName ?? "The professor"} is ${profile?.title ?? "an academic"} at ${profile?.institution ?? "their institution"}. Visit the About page to learn more about their background, research interests, and academic journey.`;
  }
  if (msg.includes("thank")) {
    return "You're welcome! Feel free to ask if you have any other questions.";
  }

  return `I can help you find information about research, publications, courses, students, events, and more on this website. Could you be more specific about what you're looking for? You can also visit the Contact page to reach ${profile?.fullName ?? "the professor"} directly.`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get profile for context
    const profile = await prisma.profile.findFirst({
      select: { fullName: true, title: true, institution: true, email: true, bio: true },
    }).catch(() => null);

    let reply: string;

    // Try OpenAI if key is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        // @ts-expect-error openai is an optional dependency loaded at runtime
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Get recent chat history for context
        const history = sessionId
          ? await prisma.chatMessage.findMany({
              where: { sessionId },
              orderBy: { createdAt: "asc" },
              take: 10,
            }).catch(() => [])
          : [];

        const systemPrompt = `You are a helpful assistant for ${profile?.fullName ?? "a professor"}'s academic website. 
${profile ? `The professor is ${profile.title} at ${profile.institution}.` : ""}
${profile?.bio ? `Background: ${profile.bio.substring(0, 500)}` : ""}

Help visitors find information about:
- Research projects and interests
- Publications and academic papers  
- Teaching courses and materials
- Students and supervision
- CV, awards, and achievements
- Events and blog posts
- Collaborations and resources
- Contact information

Be concise, friendly, and professional. Direct visitors to the relevant pages when appropriate.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user" as const, content: message },
        ];

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 300,
          temperature: 0.7,
        });

        reply = completion.choices[0]?.message?.content ?? getRuleBasedResponse(message, profile);
      } catch {
        // Fall back to rule-based if OpenAI fails
        reply = getRuleBasedResponse(message, profile);
      }
    } else {
      // No API key — use rule-based responses
      reply = getRuleBasedResponse(message, profile);
    }

    // Save to chat history if sessionId provided
    if (sessionId) {
      await prisma.chatMessage.createMany({
        data: [
          { sessionId, role: "user", content: message },
          { sessionId, role: "assistant", content: reply },
        ],
      }).catch(() => {});
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
