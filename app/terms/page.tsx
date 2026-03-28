export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        Welcome to Instabels. By using our service, you agree to the following terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Use of Service</h2>
      <p className="mb-4">
        Instabels provides tools to create, edit, and print buffet labels. You agree to use the service only for lawful purposes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Accounts</h2>
      <p className="mb-4">
        You are responsible for maintaining the security of your account and any activity under it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Subscription & Billing</h2>
      <p className="mb-4">
        Paid features are billed on a recurring monthly basis. You may cancel your subscription at any time. Access to paid features will remain active until the end of the billing period.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Intellectual Property</h2>
      <p className="mb-4">
        All content, software, and functionality of Instabels are owned by Instabels LLC and may not be copied, distributed, or reverse engineered.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate accounts that violate these terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Disclaimer</h2>
      <p className="mb-4">
        Instabels is provided "as is" without warranties of any kind.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Limitation of Liability</h2>
      <p className="mb-4">
        Instabels LLC is not liable for any indirect or consequential damages arising from use of the service.
      </p>

      <p className="mt-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Instabels LLC. All rights reserved.
      </p>
    </main>
  );
}