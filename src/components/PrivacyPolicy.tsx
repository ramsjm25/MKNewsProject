import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  console.log("Privacy Policy component rendering");

  return (
    <>
      <Header />

      {/* Privacy Policy Section with Background Color */}
      <section className="relative py-12 px-4 font-mandali overflow-hidden" style={{ backgroundImage: "url('/lovable-uploads/About1.jpg')" }}>
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-blue-100 bg-opacity-90"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("privacyPolicy.title")}
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Enhanced Card containing Privacy Policy Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
            <div className="p-6 lg:p-8">
              <div className="space-y-6 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {t("privacyPolicy.lastUpdated")}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {t("privacyPolicy.companyName")}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("privacyPolicy.intro1")}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-4">
                    {t("privacyPolicy.intro2")}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section1Title")}
                    </h3>
                    
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      {t("privacyPolicy.section1Subtitle1")}
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                      {t("privacyPolicy.techDataList").split(", ").map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {t("privacyPolicy.techDataDesc")}
                    </p>

                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      {t("privacyPolicy.section1Subtitle2")}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{t("privacyPolicy.piiDesc1")}</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                      {t("privacyPolicy.piiList").split(", ").map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.piiDesc2")}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section2Title")}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{t("privacyPolicy.useInfoDesc")}</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.useInfoList").split(", ").map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section3Title")}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.dataProtectionDesc")}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section4Title")}
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.sharingList").split(", ").map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section5Title")}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.userChoicesDesc")}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section6Title")}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.adPrivacyDesc")}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section7Title")}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.changesDesc")}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.section8Title")}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t("privacyPolicy.acceptanceDesc")}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-xl border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {t("privacyPolicy.contactTitle")}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {t("privacyPolicy.contactDesc")}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">
                      {t("privacyPolicy.copyright")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
