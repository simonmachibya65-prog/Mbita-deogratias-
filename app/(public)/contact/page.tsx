import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProfessorAvatar from "@/components/ui/ProfessorAvatar";
import ContactForm from "@/components/forms/ContactForm";
import FAQAccordion from "@/components/sections/FAQAccordion";
import AppointmentForm from "@/components/sections/AppointmentForm";
import Image from "next/image";
import { getPhotoForSlot } from "@/lib/profilePhotos";

interface AcademicProfile {
  label: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export const dynamic = "force-dynamic";

async function getProfile() {
  try {
    return await prisma.profile.findFirst();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: "Contact",
    description: profile
      ? `Get in touch with ${profile.fullName}, ${profile.title} at ${profile.institution}.`
      : "Contact the professor.",
    openGraph: { title: "Contact", description: "Send a message or find contact information." },
  };
}

export default async function ContactPage() {
  const profile = await getProfile();
  const academicProfiles = Array.isArray(profile?.academicProfiles) ? (profile!.academicProfiles as unknown as AcademicProfile[]) : [];
  const faqItems = Array.isArray(profile?.faq) ? (profile!.faq as unknown as FAQItem[]) : [];
  // Use contact-specific photo slot
  const contactPhoto = getPhotoForSlot(profile, "contact");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-10">Contact</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* ── LEFT: Contact details ── */}
        <section>
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
            {profile && (
              <div className="flex-shrink-0">
                <ProfessorAvatar
                  photoUrl={contactPhoto || profile?.photoUrl}
                  alt={`${profile.fullName} — ${profile.title}`}
                  width={150}
                  height={150}
                  className="shadow-md"
                />
              </div>
            )}
            {profile && (
              <div>
                <h2 className="text-xl font-semibold text-navy-900">{profile.fullName}</h2>
                <p className="text-navy-700">{profile.title}</p>
                <p className="text-navy-600">{profile.department}</p>
                <p className="text-navy-600">{profile.institution}</p>
              </div>
            )}
          </div>

          {profile && (
            <div className="space-y-5">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-0.5">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    {profile.email}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              {profile.whatsapp && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-0.5">WhatsApp</p>
                    <a
                      href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >
                      {profile.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {/* Office */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-0.5">Office</p>
                  <p className="text-navy-700">{profile.officeLocation}</p>
                </div>
              </div>

              {/* Office hours */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-0.5">Office Hours</p>
                  <p className="text-navy-700">{profile.officeHours}</p>
                </div>
              </div>

              {/* Academic profiles */}
              {academicProfiles.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-2">Academic Profiles</p>
                  <div className="flex flex-wrap gap-2">
                    {academicProfiles.map((ap: AcademicProfile, i: number) => (
                      <a
                        key={i}
                        href={ap.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-navy-100 text-navy-900 text-sm rounded-md hover:bg-navy-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {ap.label}
                        <svg className="ml-1.5 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Building image */}
          {profile?.buildingImageUrl && (
            <div className="mt-6 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={profile.buildingImageUrl}
                alt="Office building"
                width={500}
                height={250}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
        </section>

        {/* ── RIGHT: Contact form ── */}
        <section>
          <h2 className="text-2xl font-semibold text-navy-900 mb-6">Send a Message</h2>
          <ContactForm />
        </section>
      </div>

      {/* ── GOOGLE MAPS ── */}
      {profile?.mapEmbedUrl && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Location</h2>
          <div className="rounded-2xl overflow-hidden shadow-lg h-80">
            <iframe
              src={profile.mapEmbedUrl}
              title="Office location map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      )}

      {/* ── APPOINTMENT BOOKING ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Book an Appointment</h2>
        <div className="max-w-2xl">
          <p className="text-navy-600 mb-6">
            Request a meeting during office hours. You will receive a confirmation once your appointment is approved.
          </p>
          <AppointmentForm />
        </div>
      </section>

      {/* ── FAQ ── */}
      {faqItems.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Frequently Asked Questions</h2>
          <div className="max-w-3xl">
            <FAQAccordion items={faqItems} />
          </div>
        </section>
      )}

      {/* ── EMERGENCY CONTACTS ── */}
      {profile?.emergencyContact && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">Emergency Contact</h2>
          <div className="max-w-xl p-5 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-800 mb-1">Emergency Contact Information</p>
                <p className="text-red-700 text-sm whitespace-pre-line">{profile.emergencyContact}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
