import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const integrations = [
      {
        id: "google-workspace",
        name: "Google Workspace",
        description: "Connect your Google Drive, Calendar, and Gmail",
        icon: "🔗",
        category: "productivity",
        features: ["Drive sync", "Calendar sync", "Gmail integration"],
        status: "available",
      },
      {
        id: "microsoft-teams",
        name: "Microsoft Teams",
        description: "Integrate with Microsoft Teams for collaboration",
        icon: "👥",
        category: "communication",
        features: ["Team chat", "Video calls", "File sharing"],
        status: "available",
      },
      {
        id: "zoom",
        name: "Zoom",
        description: "Schedule and join Zoom meetings",
        icon: "📹",
        category: "video",
        features: ["Meeting scheduling", "Recording", "Breakout rooms"],
        status: "available",
      },
      {
        id: "canvas-lms",
        name: "Canvas LMS",
        description: "Sync courses and assignments with Canvas",
        icon: "🎓",
        category: "lms",
        features: ["Course sync", "Grade sync", "Assignment import"],
        status: "available",
      },
      {
        id: "moodle",
        name: "Moodle",
        description: "Connect with Moodle learning platform",
        icon: "📚",
        category: "lms",
        features: ["Course integration", "User sync", "Activity tracking"],
        status: "available",
      },
      {
        id: "github",
        name: "GitHub",
        description: "Link your GitHub repositories and projects",
        icon: "💻",
        category: "development",
        features: ["Repo sync", "Project tracking", "Code review"],
        status: "available",
      },
      {
        id: "slack",
        name: "Slack",
        description: "Get notifications in Slack channels",
        icon: "💬",
        category: "communication",
        features: ["Notifications", "Bot commands", "Channel integration"],
        status: "available",
      },
      {
        id: "dropbox",
        name: "Dropbox",
        description: "Sync files with Dropbox",
        icon: "📦",
        category: "storage",
        features: ["File sync", "Backup", "Sharing"],
        status: "available",
      },
    ];

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Integrations list error:", error);
    return NextResponse.json({ error: "Failed to load integrations" }, { status: 500 });
  }
}
