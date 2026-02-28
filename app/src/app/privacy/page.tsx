import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - JobMatch Pro",
  description:
    "Privacy Policy for JobMatch Pro AI-powered job matching platform. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-muted text-sm">
            Effective Date: February 1, 2026 &middot; Last Updated: February
            25, 2026
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-foreground/90 leading-relaxed">
          {/* Introduction */}
          <section>
            <p className="text-sm leading-7">
              JobMatch Pro, Inc. (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use the JobMatch Pro platform
              (&ldquo;the Service&rdquo;). Please read this Privacy Policy
              carefully. By using the Service, you consent to the data practices
              described in this policy.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              1. Information We Collect
            </h2>
            <p className="text-sm leading-7">
              We collect information that you provide directly to us, information
              collected automatically, and information from third-party sources:
            </p>

            <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
              1.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-sm leading-7">
              <li>
                <strong>Account information:</strong> Name, email address, and
                profile photo provided through Google OAuth authentication
              </li>
              <li>
                <strong>Resume text:</strong> Resume or CV content you paste or
                upload for AI-powered job scoring
              </li>
              <li>
                <strong>Job search preferences:</strong> Keywords, desired
                locations, salary range expectations, remote work preferences,
                and deal-breaker criteria
              </li>
              <li>
                <strong>Profile data:</strong> Search profiles you create,
                including profile names and configurations
              </li>
              <li>
                <strong>Communications:</strong> Any messages you send to us via
                email or support channels
              </li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
              1.2 Information Collected Automatically
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-sm leading-7">
              <li>
                <strong>Usage data:</strong> Pages visited, features used,
                search queries, job scores viewed, and export activity
              </li>
              <li>
                <strong>Device information:</strong> Browser type, operating
                system, device type, and screen resolution
              </li>
              <li>
                <strong>Log data:</strong> IP address, access times, referring
                URLs, and error logs
              </li>
              <li>
                <strong>Cookies and similar technologies:</strong> Session
                tokens, authentication state, and preferences (see Section 9)
              </li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
              1.3 Information from Third Parties
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-sm leading-7">
              <li>
                <strong>Google OAuth:</strong> Basic profile information (name,
                email, profile picture) from your Google account
              </li>
              <li>
                <strong>Payment processor:</strong> Stripe provides us with
                subscription status and billing history (we do not store full
                credit card numbers)
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-sm leading-7">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>Service delivery:</strong> To aggregate job listings,
                score them against your resume and preferences using AI, and
                present results to you
              </li>
              <li>
                <strong>Account management:</strong> To create, maintain, and
                authenticate your account
              </li>
              <li>
                <strong>Personalization:</strong> To tailor job results and
                recommendations to your preferences
              </li>
              <li>
                <strong>Communication:</strong> To send transactional emails,
                daily job digests (if subscribed), billing notifications, and
                service updates
              </li>
              <li>
                <strong>Improvement:</strong> To analyze usage patterns, improve
                our AI scoring algorithms, and enhance the overall user
                experience
              </li>
              <li>
                <strong>Compliance:</strong> To comply with legal obligations,
                resolve disputes, and enforce our agreements
              </li>
              <li>
                <strong>Security:</strong> To detect, prevent, and respond to
                fraud, abuse, and security incidents
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              3. AI Processing Disclosure
            </h2>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
              <p className="text-sm leading-7 font-medium text-blue-900">
                Important: This section explains how your data is processed by
                artificial intelligence.
              </p>
            </div>
            <p className="text-sm leading-7">
              JobMatch Pro uses Claude, an AI model developed by Anthropic, to
              score and evaluate job listings against your resume and
              preferences. Here is how this process works:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>What is sent to the AI:</strong> When scoring jobs, we
                send your resume text, job preferences (keywords, locations,
                salary range, deal-breakers), and the job listing details to
                Anthropic&rsquo;s Claude API
              </li>
              <li>
                <strong>Purpose:</strong> The AI evaluates how well each job
                listing matches your profile and returns a match score (0-100)
                with a human-readable explanation
              </li>
              <li>
                <strong>Data retention by AI provider:</strong> Anthropic does
                not use API inputs or outputs to train their models. Your resume
                text and preferences are processed in real-time and are not
                stored by Anthropic after the API request is completed
              </li>
              <li>
                <strong>No persistent AI memory:</strong> Each scoring request
                is independent. The AI does not retain memory of your data
                between requests
              </li>
              <li>
                <strong>Our data storage:</strong> We store AI-generated scores
                and explanations in our encrypted database as part of your job
                results. Your resume text is stored in our database (encrypted
                at rest) for use in future scoring requests
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              4. Data Sharing
            </h2>
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg mb-4">
              <p className="text-sm leading-7 font-medium text-green-900">
                We never sell, rent, or trade your personal data to third
                parties.
              </p>
            </div>
            <p className="text-sm leading-7">
              We may share your information only in the following limited
              circumstances:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>AI processing:</strong> Resume text and preferences are
                shared with Anthropic (Claude) solely for job scoring purposes,
                as described in Section 3
              </li>
              <li>
                <strong>Payment processing:</strong> Billing information is
                shared with Stripe for subscription management. Stripe&rsquo;s
                privacy policy governs their handling of your payment data
              </li>
              <li>
                <strong>Google Sheets:</strong> When you use the export feature,
                job data is written to your connected Google Sheets account using
                Google&rsquo;s APIs, with your explicit authorization
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information
                if required by law, subpoena, court order, or governmental
                regulation
              </li>
              <li>
                <strong>Business transfers:</strong> In the event of a merger,
                acquisition, or sale of assets, your information may be
                transferred to the acquiring entity
              </li>
              <li>
                <strong>With your consent:</strong> We may share information
                with third parties when you have given explicit consent
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              5. Data Security
            </h2>
            <p className="text-sm leading-7">
              We implement industry-standard security measures to protect your
              data:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>Encryption at rest:</strong> All sensitive data,
                including resume text and personal information, is encrypted
                using AES-256-GCM encryption before being stored in our database
              </li>
              <li>
                <strong>Encryption in transit:</strong> All data transmitted
                between your browser and our servers is encrypted using TLS 1.3
              </li>
              <li>
                <strong>Access controls:</strong> Database access is restricted
                to authorized personnel and services through role-based access
                controls
              </li>
              <li>
                <strong>Authentication:</strong> We use OAuth 2.0 with Google
                for secure authentication, with server-side session management
                using signed JWT tokens
              </li>
              <li>
                <strong>Infrastructure:</strong> Our application is hosted on
                secure, SOC 2-compliant cloud infrastructure with automated
                backups and monitoring
              </li>
              <li>
                <strong>Security reviews:</strong> We conduct regular security
                assessments and promptly address any identified vulnerabilities
              </li>
            </ul>
            <p className="text-sm leading-7 mt-3">
              While we strive to use commercially acceptable means to protect
              your data, no method of electronic storage or transmission is 100%
              secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              6. Google OAuth Data
            </h2>
            <p className="text-sm leading-7">
              When you sign in with Google, we request access to the following
              information from your Google account:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>Basic profile:</strong> Your name, email address, and
                profile picture for account creation and display
              </li>
              <li>
                <strong>Email address:</strong> Used as your unique account
                identifier and for transactional communications
              </li>
            </ul>
            <p className="text-sm leading-7 mt-3">
              We adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark underline underline-offset-2"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. We only use Google user
              data for the purposes described in this policy and do not transfer
              it to third parties except as necessary to provide the Service.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              7. Google Sheets Integration
            </h2>
            <p className="text-sm leading-7">
              If you choose to use the Google Sheets export feature, you will be
              asked to grant additional permissions:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>Scope requested:</strong> We request write access to
                Google Sheets in your Google Drive to create and populate
                spreadsheets with your scored job data
              </li>
              <li>
                <strong>Data exported:</strong> Job titles, company names,
                locations, salary ranges, match scores, AI reasoning summaries,
                listing URLs, and discovery dates
              </li>
              <li>
                <strong>Access control:</strong> You can revoke Google Sheets
                access at any time through your Google Account permissions
                settings
              </li>
              <li>
                <strong>No reading:</strong> We do not read or access any
                existing content in your Google Sheets or Google Drive beyond the
                spreadsheets we create
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              8. Cookies &amp; Tracking
            </h2>
            <p className="text-sm leading-7">
              We use cookies and similar technologies for the following purposes:
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface text-left">
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
                      Cookie Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
                      Purpose
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">Essential</td>
                    <td className="px-4 py-3">
                      Authentication session, CSRF protection
                    </td>
                    <td className="px-4 py-3">Session / 30 days</td>
                  </tr>
                  <tr className="border-b border-border bg-surface/30">
                    <td className="px-4 py-3 font-medium">Functional</td>
                    <td className="px-4 py-3">
                      User preferences, sidebar state, theme
                    </td>
                    <td className="px-4 py-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Analytics</td>
                    <td className="px-4 py-3">
                      Anonymous usage statistics, feature adoption
                    </td>
                    <td className="px-4 py-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm leading-7 mt-4">
              We do not use advertising cookies or third-party tracking pixels.
              You can configure your browser to refuse cookies, but this may
              limit your ability to use certain features of the Service.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              9. Data Retention
            </h2>
            <p className="text-sm leading-7">
              We retain your personal information for as long as your account is
              active or as needed to provide the Service. Specific retention
              periods include:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm leading-7">
              <li>
                <strong>Account data:</strong> Retained for the duration of your
                account. Deleted within 30 days of account deletion request
              </li>
              <li>
                <strong>Resume text:</strong> Stored encrypted in our database
                while your account is active. Permanently deleted upon account
                deletion
              </li>
              <li>
                <strong>Job scores and results:</strong> Retained for 90 days
                after generation, then automatically purged
              </li>
              <li>
                <strong>Usage logs:</strong> Retained for 12 months for
                analytics and debugging, then anonymized or deleted
              </li>
              <li>
                <strong>Billing records:</strong> Retained for 7 years as
                required by financial regulations
              </li>
              <li>
                <strong>AI processing:</strong> Resume text sent to
                Anthropic&rsquo;s Claude API is processed in real-time and not
                retained by the AI provider after the request completes
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              10. GDPR / CCPA Rights
            </h2>
            <p className="text-sm leading-7">
              Depending on your jurisdiction, you may have the following rights
              regarding your personal data:
            </p>

            <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
              For EU/EEA Residents (GDPR)
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-sm leading-7">
              <li>
                <strong>Right of access:</strong> Request a copy of the personal
                data we hold about you
              </li>
              <li>
                <strong>Right to rectification:</strong> Request correction of
                inaccurate personal data
              </li>
              <li>
                <strong>Right to erasure:</strong> Request deletion of your
                personal data (&ldquo;right to be forgotten&rdquo;)
              </li>
              <li>
                <strong>Right to restrict processing:</strong> Request that we
                limit the processing of your data
              </li>
              <li>
                <strong>Right to data portability:</strong> Receive your data in
                a structured, machine-readable format
              </li>
              <li>
                <strong>Right to object:</strong> Object to processing of your
                data for certain purposes
              </li>
              <li>
                <strong>Right regarding automated decisions:</strong> Request
                human review of decisions made solely by automated means,
                including AI scoring
              </li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
              For California Residents (CCPA)
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-sm leading-7">
              <li>
                <strong>Right to know:</strong> Know what personal information
                we collect, use, and disclose
              </li>
              <li>
                <strong>Right to delete:</strong> Request deletion of your
                personal information
              </li>
              <li>
                <strong>Right to opt-out:</strong> Opt out of the sale of your
                personal information (note: we do not sell personal information)
              </li>
              <li>
                <strong>Right to non-discrimination:</strong> Not be
                discriminated against for exercising your privacy rights
              </li>
            </ul>

            <p className="text-sm leading-7 mt-4">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@jobmatchpro.com"
                className="text-primary hover:text-primary-dark underline underline-offset-2"
              >
                privacy@jobmatchpro.com
              </a>
              . We will respond to verified requests within 30 days.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              11. Children&rsquo;s Privacy
            </h2>
            <p className="text-sm leading-7">
              The Service is not intended for individuals under the age of 16.
              We do not knowingly collect personal information from children
              under 16. If we become aware that we have collected personal
              information from a child under 16, we will take steps to delete
              such information promptly. If you believe a child under 16 has
              provided us with personal information, please contact us at{" "}
              <a
                href="mailto:privacy@jobmatchpro.com"
                className="text-primary hover:text-primary-dark underline underline-offset-2"
              >
                privacy@jobmatchpro.com
              </a>
              .
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              12. Changes to This Policy
            </h2>
            <p className="text-sm leading-7">
              We may update this Privacy Policy from time to time. When we make
              material changes, we will notify you by posting the updated policy
              on this page with a revised &ldquo;Last Updated&rdquo; date and,
              where appropriate, sending you an email notification. We encourage
              you to review this Privacy Policy periodically to stay informed
              about how we protect your data. Your continued use of the Service
              after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              13. Contact Information
            </h2>
            <p className="text-sm leading-7">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-surface rounded-lg border border-border text-sm leading-7">
              <p className="font-medium text-foreground">JobMatch Pro, Inc.</p>
              <p>Privacy Officer: privacy@jobmatchpro.com</p>
              <p>General Support: support@jobmatchpro.com</p>
              <p>Legal Inquiries: legal@jobmatchpro.com</p>
            </div>
            <p className="text-sm leading-7 mt-4">
              For GDPR-related inquiries, you may also lodge a complaint with
              your local data protection authority.
            </p>
          </section>
        </div>

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Link
            href="/terms"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Terms of Service
          </Link>
          <p>&copy; 2026 JobMatch Pro, Inc. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
