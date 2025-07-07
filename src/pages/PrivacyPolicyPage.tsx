import { NewsHeader } from '@/components/news/NewsHeader';
import { Footer } from '@/components/news/Footer';
import { Lock } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
      
      <main className="flex-1 flex items-center justify-center py-12 px-2">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 animate-fade-in">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-red-100 dark:bg-red-900/40 rounded-full p-4 mb-4">
              <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white text-center mb-2 tracking-tight">Privacy Policy</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-600 rounded-full mb-2" />
            <p className="text-base text-gray-500 dark:text-gray-400 text-center">Last updated: July 2024</p>
          </div>
          <div className="prose prose-base dark:prose-invert max-w-none prose-h2:text-red-700 dark:prose-h2:text-red-400 prose-h2:font-extrabold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-p:leading-relaxed prose-p:text-lg prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-4 prose-li:leading-relaxed prose-li:text-base prose-li:text-gray-700/80 dark:prose-li:text-gray-300 prose-li:mb-3 prose-ul:pl-7 prose-ul:list-disc prose-a:text-red-600 dark:prose-a:text-red-400 prose-a:underline">
            <p>
              Voice of Bharat ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>

            <h2>1. Information We Collect</h2>
            <ul>
              <li><strong>Personal Information:</strong> We may collect your name, email address, and other contact details if you subscribe to our newsletter or contact us.</li>
              <li><strong>Usage Data:</strong> We collect information about how you use our website, such as your IP address, browser type, device information, and pages visited.</li>
              <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience and analyze website traffic.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To provide, operate, and maintain our website</li>
              <li>To improve, personalize, and expand our website</li>
              <li>To understand and analyze how you use our website</li>
              <li>To communicate with you, including for customer service and updates</li>
              <li>To send you newsletters, if you have subscribed</li>
              <li>To detect and prevent fraud</li>
            </ul>

            <h2>3. Sharing Your Information</h2>
            <p>
              We do not sell or rent your personal information. We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving our users, as long as those parties agree to keep this information confidential.
            </p>

            <h2>4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction. You can choose to disable cookies through your browser settings.
            </p>

            <h2>5. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party sites. We are not responsible for the privacy practices or the content of those sites. We encourage you to read the privacy policies of any third-party site you visit.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>7. Children's Privacy</h2>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h2>8. Your Rights</h2>
            <ul>
              <li>You have the right to access, update, or delete your personal information.</li>
              <li>You may unsubscribe from our newsletter at any time using the link provided in the email.</li>
            </ul>

            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with a new "Last updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> <a href="mailto:news@voiceofbharat.live">news@voiceofbharat.live</a>
            </p>
          </div>
        </div>
      </main>
     
    </div>
  );
};

export default PrivacyPolicyPage; 