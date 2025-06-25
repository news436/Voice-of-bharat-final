import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Enable Supabase
import { motion } from 'framer-motion';
import { Banknote, QrCode, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Database } from '@/integrations/supabase/types';

const SupportUsPage = () => {
  const [supportDetails, setSupportDetails] = useState<Database['public']['Tables']['support_details']['Row']>({
    id: 1,
    description: "Your support is vital to our mission. Every contribution, no matter the size, empowers us to continue delivering fearless, independent journalism and to amplify the voices that matter. By supporting Voice of Bharat, you are investing in a more informed and engaged society.",
    description_hi: "",
    account_holder_name: "VOICE OF BHARAT FOUNDATION",
    account_holder_name_hi: "",
    account_number: "123456789012",
    ifsc_code: "VOBF0001234",
    bank_name: "National Bank of India",
    qr_code_image_url: "/placeholder-qr.svg", // Updated to use SVG placeholder
    upi_id: "voiceofbharat@upi",
    created_at: "",
    updated_at: ""
  });
  const [isLoading, setIsLoading] = useState(true); // Enable loading
  const { language } = useLanguage();

  useEffect(() => {
    const fetchSupportDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('support_details')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setSupportDetails(data);
        }
      } catch (error) {
        console.error("Error fetching support details:", error);
        toast({ title: "Error", description: "Could not load support details. Displaying default information.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupportDetails();
  }, []);
  
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${field} has been copied to your clipboard.` });
  };

  const AnimatedSection = ({ children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-black font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-black text-white text-center py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            {language === 'hi' ? 'स्वतंत्र पत्रकारिता का समर्थन करें' : 'Support Independent Journalism'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-lg md:text-xl max-w-3xl mx-auto opacity-90"
          >
            {language === 'hi' && supportDetails.description_hi ? supportDetails.description_hi : supportDetails.description}
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
          {/* QR Code and UPI Section */}
          <AnimatedSection>
            <div className="space-y-8 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {language === 'hi' ? 'स्कैन करें और भुगतान करें' : 'Scan & Pay'}
                </h2>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-lg border-4 border-red-600">
                    <img src={supportDetails.qr_code_image_url} alt="QR Code for payment" className="w-48 h-48 md:w-56 md:h-56" />
                  </div>
                </div>
                 <div className="flex flex-col items-center gap-2 mt-2">
                  <p className="text-lg font-mono p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-200">
                    {supportDetails.upi_id}
                  </p>
                  <Button 
                    onClick={() => copyToClipboard(supportDetails.upi_id, 'UPI ID')}
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Bank Details Section */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg space-y-6">
              <h2 className="text-3xl font-bold border-b pb-4 text-gray-900 dark:text-white flex items-center gap-3">
                <Banknote className="w-8 h-8 text-red-600" />
                <span>{language === 'hi' ? 'प्रत्यक्ष बैंक ट्रांसफर' : 'Direct Bank Transfer'}</span>
              </h2>
              
              <div className="space-y-4">
                {[
                  { label: "Account Holder Name", value: supportDetails.account_holder_name },
                  { label: "Account Number", value: supportDetails.account_number },
                  { label: "IFSC Code", value: supportDetails.ifsc_code },
                  { label: "Bank Name", value: supportDetails.bank_name },
                ].map((item) => (
                  <div key={item.label} className="py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{item.label}</p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-white">{item.value}</p>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.value, item.label)}>Copy</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
};

export default SupportUsPage; 