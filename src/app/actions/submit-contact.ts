'use server';

import { z } from 'zod';

// Define the schema for contact form data validation
const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(5, "Message must be at least 5 characters long"),
});

// Define the return type for the action
interface ContactActionResult {
    success: boolean;
    error?: string;
    data?: z.infer<typeof ContactFormSchema>;
}

export async function submitContactFormAction(formData: FormData): Promise<ContactActionResult> {
  // Extract data from FormData
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

   // Validate the data using Zod
   const validationResult = ContactFormSchema.safeParse(rawData);

   if (!validationResult.success) {
     const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
     console.error("Contact Form Validation Error:", validationResult.error.flatten());
     return { success: false, error: `Validation failed: ${errorMessages}` };
   }

    const validatedData = validationResult.data;

  // --- Placeholder for Database Interaction or Email Sending ---
  try {
      // Example: Send an email or save to a "contact_messages" collection
      // console.log("Contact form submitted:", validatedData);
      // await sendEmail(validatedData); // Hypothetical email sending function

      return { success: true, data: validatedData };

  } catch (error) {
      console.error("Error processing contact form:", error);
      return { success: false, error: "Failed to process your message. Please try again." };
  }
  // --- End of Placeholder ---
}
