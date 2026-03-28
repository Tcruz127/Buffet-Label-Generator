export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Instabels respects your privacy. This policy explains how we collect and use your information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Email address and account information</li>
        <li>Saved label data and content you create</li>
        <li>Payment information handled securely by Stripe</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Information</h2>
      <p className="mb-4">
        We use your data to provide, improve, and maintain the Instabels service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Payments</h2>
      <p className="mb-4">
        Payments are processed by Stripe. We do not store your credit card information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Data Security</h2>
      <p className="mb-4">
        We take reasonable measures to protect your data but cannot guarantee absolute security.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Sharing</h2>
      <p className="mb-4">
        We do not sell or share your personal data with third parties except as required to operate the service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Your Rights</h2>
      <p className="mb-4">
        You may request deletion of your account and data at any time.
      </p>

      <p className="mt-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Instabels LLC. All rights reserved.
      </p>
    </main>
  );
}