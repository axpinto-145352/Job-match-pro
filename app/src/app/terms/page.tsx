import Link from "next/link";

export const metadata = {
  title: "Terms of Service - JobMatch Pro",
  description: "Terms of Service for JobMatch Pro AI-powered job matching platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border bg-surface/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
              JM
            </div>
            <span className="font-semibold text-foreground text-sm">
              JobMatch Pro
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Terms of Service
          </h1>
          <p className="text-muted text-sm">
            Effective Date: February 1, 2026 &middot; Last Updated: February 25, 2026
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-foreground/90 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm leading-7">
              By accessing or using JobMatch Pro (&ldquo;the Service&rdquo;), operated by JobMatch Pro, Inc.
              (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of
              Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not access or use the
              Service. We reserve the right to modify these Terms at any time, and your continued use of the
              Service constitutes acceptance of any such modifications.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              2. Description of Service
            </h2>
            <p className="text-sm leading-7">
              JobMatch Pro is an AI-powered job search aggregation platform that collects job listings
              from multiple third-party sources and scores them against your resume and preferences
              using artificial intelligence. The Service provides:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>Aggregation of job listings from 7+ job boards and APIs</li>
              <li>
                AI-powered job scoring using Claude by Anthropic to evaluate how well a job matches
                your resume and stated preferences
              </li>
              <li>Search profile management with customizable keywords, locations, and deal-breakers</li>
              <li>Export functionality to Google Sheets for tracking applications</li>
              <li>Tiered subscription plans with varying levels of access and features</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              3. User Accounts
            </h2>
            <p className="text-sm leading-7">
              To use the Service, you must create an account using Google OAuth authentication. You are
              responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Immediately notify us of any unauthorized use of your account</li>
              <li>Not create multiple accounts for the purpose of circumventing usage limits</li>
              <li>Not share your account access with third parties</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              4. Subscription &amp; Billing
            </h2>
            <p className="text-sm leading-7">
              JobMatch Pro offers the following subscription tiers, billed monthly:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface text-left">
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
                      Plan
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
                      Price
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
                      Job Matches/Day
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
                      Profiles
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Free</td>
                    <td className="px-4 py-3">$0/month</td>
                    <td className="px-4 py-3">10</td>
                    <td className="px-4 py-3">1</td>
                  </tr>
                  <tr className="border-b border-border bg-surface/30">
                    <td className="px-4 py-3 font-medium">Pro</td>
                    <td className="px-4 py-3">$29/month</td>
                    <td className="px-4 py-3">100</td>
                    <td className="px-4 py-3">5</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Premium</td>
                    <td className="px-4 py-3">$79/month</td>
                    <td className="px-4 py-3">500</td>
                    <td className="px-4 py-3">20</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Enterprise</td>
                    <td className="px-4 py-3">$199/month</td>
                    <td className="px-4 py-3">Unlimited</td>
                    <td className="px-4 py-3">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-7 mt-4">
              All paid subscriptions are processed through Stripe. You may cancel your subscription at any
              time through the billing portal. Cancellation takes effect at the end of your current billing
              period. We do not offer refunds for partial billing periods. Prices are subject to change
              with 30 days&rsquo; notice.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              5. AI-Generated Content Disclaimer
            </h2>
            <p className="text-sm leading-7">
              JobMatch Pro uses artificial intelligence, specifically Claude by Anthropic, to analyze and
              score job listings against your resume and preferences. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                AI-generated scores and recommendations are provided for informational purposes only and
                should not be solely relied upon for employment decisions
              </li>
              <li>
                AI scoring may contain inaccuracies, biases, or errors inherent in any automated system
              </li>
              <li>
                We do not guarantee that AI scores accurately reflect your suitability for any particular
                job position
              </li>
              <li>
                You are solely responsible for evaluating job opportunities and making application decisions
              </li>
              <li>
                AI models may change or be updated, which could affect scoring consistency over time
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              6. Data Usage &amp; Privacy
            </h2>
            <p className="text-sm leading-7">
              Your use of the Service is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary-dark underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Key data handling practices include:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>Resume text</strong> is sent to Anthropic&rsquo;s Claude AI solely for the purpose of
                scoring job matches. Resume text is not stored by the AI provider after processing.
              </li>
              <li>
                <strong>Data retention:</strong> Your resume text and profile data are stored in our encrypted
                database for the duration of your account. You may delete your data at any time.
              </li>
              <li>
                We encrypt sensitive data at rest using AES-256-GCM encryption
              </li>
              <li>
                We do not sell, rent, or trade your personal data to third parties
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              7. Job Data Accuracy Disclaimer
            </h2>
            <p className="text-sm leading-7">
              Job listings displayed on JobMatch Pro are aggregated from third-party sources. We do not
              verify the accuracy, completeness, or legitimacy of any job listing. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>Job listings may be outdated, inaccurate, or no longer available</li>
              <li>Salary information, when provided, is sourced from third parties and may not reflect actual compensation</li>
              <li>We are not responsible for the content, accuracy, or legitimacy of any third-party job listing</li>
              <li>We are not an employer, recruiter, or staffing agency, and do not guarantee employment</li>
              <li>
                You should independently verify all job details before applying or accepting any position
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-sm leading-7">
              The Service, including its original content, features, functionality, design, and branding
              (excluding content provided by users and third-party job listings), is and remains the
              exclusive property of JobMatch Pro, Inc. and is protected by copyright, trademark, and
              other intellectual property laws. You may not reproduce, distribute, modify, create
              derivative works of, publicly display, or exploit any content from the Service without
              our express written permission.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-sm leading-7">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, JOBMATCH PRO, INC. AND ITS
              OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>Your access to or use of (or inability to access or use) the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any job listing content obtained from or through the Service</li>
              <li>AI-generated scores, recommendations, or analyses</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <p className="text-sm leading-7 mt-3">
              In no event shall our total liability exceed the amount you have paid us in the twelve (12)
              months preceding the event giving rise to the liability, or one hundred dollars ($100),
              whichever is greater.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              10. Termination
            </h2>
            <p className="text-sm leading-7">
              We may terminate or suspend your account and access to the Service immediately, without
              prior notice or liability, for any reason, including but not limited to a breach of these
              Terms. You may terminate your account at any time by contacting us or through your account
              settings. Upon termination:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>Your right to use the Service will immediately cease</li>
              <li>We may delete your account data within 30 days of termination</li>
              <li>Any outstanding subscription charges remain your responsibility</li>
              <li>Sections that by their nature should survive termination shall survive</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-sm leading-7">
              We reserve the right to modify or replace these Terms at any time at our sole discretion.
              If a revision is material, we will provide at least 30 days&rsquo; notice prior to any new
              terms taking effect by posting a notice on the Service or sending an email notification.
              What constitutes a material change will be determined at our sole discretion. Your continued
              use of the Service after the effective date of any changes constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              12. Contact Information
            </h2>
            <p className="text-sm leading-7">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-surface rounded-lg border border-border text-sm leading-7">
              <p className="font-medium text-foreground">JobMatch Pro, Inc.</p>
              <p>Email: legal@jobmatchpro.com</p>
              <p>Support: support@jobmatchpro.com</p>
            </div>
          </section>
        </div>

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Link
            href="/privacy"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Privacy Policy
          </Link>
          <p>&copy; 2026 JobMatch Pro, Inc. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
