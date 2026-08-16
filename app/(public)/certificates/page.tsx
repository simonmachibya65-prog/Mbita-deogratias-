import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Certificates",
  description: "Generate and verify digital certificates",
};

export default function CertificatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-600 to-yellow-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🏆 Digital Certificates</h1>
          <p className="text-xl text-amber-100 max-w-3xl">
            Generate professional certificates with QR verification and blockchain support
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Certificates Issued", value: "1,234", icon: "🏆" },
            { label: "Verifications", value: "5,678", icon: "✅" },
            { label: "Templates", value: "12", icon: "📄" },
            { label: "Blockchain Verified", value: "892", icon: "🔗" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Certificate Preview */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12 border-4 border-amber-500">
          <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center">📜 Certificate Preview</h2>
          <div className="border-8 border-double border-amber-600 p-12 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg">
            <div className="text-center space-y-6">
              <div className="text-amber-600 text-5xl mb-4">🎓</div>
              <h1 className="text-4xl font-bold text-navy-900 font-serif">Certificate of Completion</h1>
              <p className="text-lg text-navy-700">This is to certify that</p>
              <h2 className="text-3xl font-bold text-amber-600">John Doe</h2>
              <p className="text-lg text-navy-700">has successfully completed</p>
              <h3 className="text-2xl font-semibold text-navy-900">Advanced Mathematics Course</h3>
              <p className="text-navy-600">with distinction on December 20, 2024</p>
              <div className="flex justify-between items-end mt-12 pt-8 border-t-2 border-gray-300">
                <div className="text-center">
                  <div className="w-48 border-t-2 border-navy-900 mb-2"></div>
                  <p className="text-sm font-semibold">Dr. Emmanuel Mbita</p>
                  <p className="text-xs text-navy-600">Professor</p>
                </div>
                <div className="w-24 h-24 bg-white border-2 border-gray-300 flex items-center justify-center rounded">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "✏️", title: "Custom Templates", desc: "Design your own certificate templates" },
            { icon: "📱", title: "QR Verification", desc: "Verify certificates with QR codes" },
            { icon: "🔗", title: "Blockchain", desc: "Optional blockchain verification" },
            { icon: "📥", title: "PDF Download", desc: "High-quality PDF certificates" },
            { icon: "💼", title: "LinkedIn Integration", desc: "Share directly to LinkedIn" },
            { icon: "🎨", title: "Bulk Generation", desc: "Generate multiple certificates at once" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Verify Certificate */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center">🔍 Verify Certificate</h2>
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter certificate code or scan QR code"
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-amber-500"
              />
              <button className="px-8 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 text-lg">
                Verify
              </button>
            </div>
            <p className="text-center text-sm text-navy-500 mt-4">
              Enter the verification code found on the certificate
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Issue Professional Certificates</h2>
          <p className="text-lg text-amber-100 mb-8">Recognize achievements with verifiable certificates</p>
          <button className="px-8 py-3 bg-white text-amber-600 rounded-lg font-semibold hover:bg-gray-100">
            Create Certificate →
          </button>
        </div>
      </div>
    </div>
  );
}
