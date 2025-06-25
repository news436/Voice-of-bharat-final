import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Enable Supabase
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Upload } from 'lucide-react';

interface SupportDetails {
  id: number;
  description: string;
  description_hi: string;
  account_holder_name: string;
  account_holder_name_hi: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  qr_code_image_url: string;
  upi_id: string;
  created_at: string;
  updated_at: string;
}

const SupportDetailsManager = () => {
  const [supportDetails, setSupportDetails] = useState<SupportDetails>({
    id: 1,
    description: '',
    description_hi: '',
    account_holder_name: '',
    account_holder_name_hi: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    qr_code_image_url: '',
    upi_id: '',
    created_at: '',
    updated_at: ''
  });
  const [isLoading, setIsLoading] = useState(true); // Enable loading
  const [isSaving, setIsSaving] = useState(false);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSupportDetails();
  }, []);

  const fetchSupportDetails = async () => {
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
      console.error('Error fetching support details:', error);
      toast({
        title: "Error",
        description: "Could not load support details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SupportDetails, value: string) => {
    setSupportDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQrCodeFile(file);
    }
  };

  const uploadQRCode = async (file: File): Promise<string> => {
    try {
      console.log('Uploading QR code to Cloudinary:', file.name);
      
      // Get Cloudinary credentials from environment variables
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary credentials not found in environment variables');
      }
      
      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'support'); // Optional: organize in a folder
      
      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Cloudinary upload successful:', result);
      
      return result.secure_url; // Return the secure URL
    } catch (error) {
      console.error('QR code upload failed:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload QR code image. Please try again.",
        variant: "destructive"
      });
      // Fallback: return the current URL if upload fails
      return supportDetails.qr_code_image_url;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let qrCodeUrl = supportDetails.qr_code_image_url;

      // Upload new QR code if selected
      if (qrCodeFile) {
        console.log('Uploading QR code file:', qrCodeFile.name);
        qrCodeUrl = await uploadQRCode(qrCodeFile);
        console.log('QR code uploaded to:', qrCodeUrl);
      }

      const dataToSave = {
        description: supportDetails.description,
        description_hi: supportDetails.description_hi,
        account_holder_name: supportDetails.account_holder_name,
        account_holder_name_hi: supportDetails.account_holder_name_hi,
        account_number: supportDetails.account_number,
        ifsc_code: supportDetails.ifsc_code,
        bank_name: supportDetails.bank_name,
        qr_code_image_url: qrCodeUrl,
        upi_id: supportDetails.upi_id
      };

      console.log('Attempting to save support details:', dataToSave);

      // First, check if a record exists
      const { data: existingData, error: checkError } = await supabase
        .from('support_details')
        .select('id')
        .limit(1);

      console.log('Existing data check:', { existingData, checkError });

      let result;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        console.log('Updating existing record with ID:', existingData[0].id);
        result = await supabase
          .from('support_details')
          .update(dataToSave)
          .eq('id', existingData[0].id);
      } else {
        // Insert new record
        console.log('No existing record found, inserting new one');
        result = await supabase
          .from('support_details')
          .insert(dataToSave);
      }

      if (result.error) {
        console.error('Save error:', result.error);
        throw result.error;
      }

      console.log('Save successful:', result.data);

      toast({
        title: "Success",
        description: "Support details updated successfully."
      });

      // Refresh data
      await fetchSupportDetails();
      setQrCodeFile(null);
    } catch (error) {
      console.error('Error saving support details:', error);
      toast({
        title: "Error",
        description: `Could not save support details: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Details Manager</h1>
        <p className="text-muted-foreground">
          Manage the payment information displayed on the Support Us page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Update the bank account details, UPI ID, and QR code for donations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={supportDetails.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter a compelling description for the support page..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="description_hi">Description (Hindi)</Label>
              <Textarea
                id="description_hi"
                value={supportDetails.description_hi}
                onChange={(e) => handleInputChange('description_hi', e.target.value)}
                placeholder="Enter a compelling description for the support page in Hindi..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                <Input
                  id="account_holder_name"
                  value={supportDetails.account_holder_name}
                  onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                  placeholder="e.g., VOICE OF BHARAT FOUNDATION"
                />
              </div>

              <div>
                <Label htmlFor="account_holder_name_hi">Account Holder Name (Hindi)</Label>
                <Input
                  id="account_holder_name_hi"
                  value={supportDetails.account_holder_name_hi}
                  onChange={(e) => handleInputChange('account_holder_name_hi', e.target.value)}
                  placeholder="e.g., वॉइस ऑफ भारत फाउंडेशन"
                />
              </div>

              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={supportDetails.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  placeholder="e.g., 123456789012"
                />
              </div>

              <div>
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input
                  id="ifsc_code"
                  value={supportDetails.ifsc_code}
                  onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
                  placeholder="e.g., VOBF0001234"
                />
              </div>

              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={supportDetails.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="e.g., National Bank of India"
                />
              </div>

              <div>
                <Label htmlFor="upi_id">UPI ID</Label>
                <Input
                  id="upi_id"
                  value={supportDetails.upi_id}
                  onChange={(e) => handleInputChange('upi_id', e.target.value)}
                  placeholder="e.g., voiceofbharat@upi"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="qr_code">QR Code Image</Label>
              <div className="mt-2 space-y-2">
                {supportDetails.qr_code_image_url && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={supportDetails.qr_code_image_url}
                      alt="Current QR Code"
                      className="w-32 h-32 object-contain border rounded-lg"
                    />
                    <span className="text-sm text-muted-foreground">
                      Current QR Code
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Input
                    id="qr_code"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {qrCodeFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {qrCodeFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportDetailsManager; 