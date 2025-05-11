'use server';

import { z } from 'zod';

// Define the schema for lead data validation
const LeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .nullable() // Allow null from FormData.get()
    .optional()
    .refine(val => {
    if (val === undefined || val === null || val.trim() === "") return true; // Optional and empty/null is fine
    return /^[+]?\d{10,15}$/.test(val.trim()); // Basic phone number regex
  }, { 
    message: "Invalid phone number format. Expected 10-15 digits, optionally starting with +."
  }),
  investmentAmount: z.string().nullable().optional(), // Allow null from FormData.get()
  loanAmount: z.string()
    .nullable() // Allow null from FormData.get() for non-appended values
    .optional()
    .transform(val => (val === undefined || val === null || val.trim() === "" ? undefined : Number(val.trim())))
    .refine(val => val === undefined || (!isNaN(val) && val > 0), {
      message: "Loan amount must be a positive number if provided.",
    }),
  message: z.string().min(5, "Message should be at least 5 characters"),
  serviceTitle: z.string().min(1, "Service title is missing"),
});

// Define the return type for the action
interface ActionResult {
    success: boolean;
    error?: string;
    data?: z.infer<typeof LeadSchema>;
}


export async function submitLeadAction(formData: FormData): Promise<ActionResult> {
  // Extract data from FormData
  const rawData = {
    name: formData.get('name'), // string | null
    email: formData.get('email'), // string | null
    phone: formData.get('phone'), // string | null
    investmentAmount: formData.get('investmentAmount'), // string | null
    loanAmount: formData.get('loanAmount'), // string | null
    message: formData.get('message'), // string | null
    serviceTitle: formData.get('serviceTitle'), // string | null
  };

   // Validate the data using Zod
   const validationResult = LeadSchema.safeParse(rawData);

   if (!validationResult.success) {
     // Construct a user-friendly error message
     const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
     console.error("Lead Form Validation Error:", validationResult.error.flatten());
     return { success: false, error: `Validation failed: ${errorMessages}` };
   }

    const validatedData = validationResult.data;


  // --- Placeholder for Database Interaction ---
  // In a real application, you would connect to your database (e.g., Firebase Firestore, Prisma)
  // and insert the validatedData here.
  try {
      // Example (replace with your DB logic):
      // const db = getFirestore(); // Assuming Firebase Firestore
      // await addDoc(collection(db, "leads"), {
      //   ...validatedData,
      //   submittedAt: serverTimestamp(), // Add a timestamp
      // });

      // console.log(`Lead for ${validatedData.serviceTitle} submitted successfully:`, validatedData);
      return { success: true, data: validatedData };

  } catch (error) {
      console.error("Error saving lead to database:", error);
      return { success: false, error: "Failed to save lead data. Please try again." };
  }
  // --- End of Placeholder ---

}
