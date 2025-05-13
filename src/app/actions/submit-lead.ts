
'use server';

import { z } from 'zod';
import { cert, getApps, initializeApp, App as FirebaseAdminApp } from 'firebase-admin/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Define the schema for lead data validation
const LeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string()
    .optional()
    .refine(val => {
    if (val === undefined || val === null || val.trim() === "") return true; 
    return /^[+]?\d{10,15}$/.test(val.trim()); 
  }, { 
    message: "Invalid phone number format. Expected 10-15 digits, optionally starting with +."
  }),
  investmentAmount: z.string().optional(), 
  loanAmount: z.string()
    .optional()
    .transform(val => (val === undefined || val === null || val.trim() === "" ? undefined : val.trim()))
    .refine(val => {
      if (val === undefined) return true; 
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, {
      message: "Loan amount must be a positive number if provided.",
    }),
  message: z.string().min(5, "Message should be at least 5 characters"),
  serviceTitle: z.string().min(1, "Service title is missing"),
});

interface ActionResult {
    success: boolean;
    error?: string;
    data?: z.infer<typeof LeadSchema>;
}

let leadAdminApp: FirebaseAdminApp | undefined;

function initializeFirebaseAdminForLead(): FirebaseAdminApp {
  if (leadAdminApp) {
    return leadAdminApp;
  }

  const existingApp = getApps().find(app => app.name === "leadApp");
  if (existingApp) {
    leadAdminApp = existingApp;
    return existingApp;
  }

  // Try GOOGLE_APPLICATION_CREDENTIALS_JSON (expects JSON string content)
  const credsJsonString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credsJsonString) {
    console.log("Firebase Admin SDK (leadApp): Attempting to initialize with GOOGLE_APPLICATION_CREDENTIALS_JSON.");
    try {
      const serviceAccount = JSON.parse(credsJsonString);
      if (typeof serviceAccount === 'object' && serviceAccount !== null && serviceAccount.project_id) {
        leadAdminApp = initializeApp({ credential: cert(serviceAccount) }, "leadApp");
        console.log("Firebase Admin SDK (leadApp): Initialized successfully using GOOGLE_APPLICATION_CREDENTIALS_JSON.");
        return leadAdminApp;
      } else {
         console.warn("Firebase Admin SDK (leadApp): GOOGLE_APPLICATION_CREDENTIALS_JSON parsed but was not a valid service account object.");
      }
    } catch (e: any) {
      console.warn(`Firebase Admin SDK (leadApp): Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON or initialize: ${e.message}.`);
    }
  }

  // Try local serviceAccountKey.json file as a fallback (for local dev)
  const localKeyPath = path.resolve(process.cwd(), 'secrets', 'serviceAccountKey.json');
  console.log(`Firebase Admin SDK (leadApp): GOOGLE_APPLICATION_CREDENTIALS_JSON not used or failed. Attempting local path: ${localKeyPath}`);
  if (fs.existsSync(localKeyPath)) {
    try {
      const serviceAccountFileContent = fs.readFileSync(localKeyPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountFileContent);
       if (typeof serviceAccount === 'object' && serviceAccount !== null && serviceAccount.project_id) {
          leadAdminApp = initializeApp({ credential: cert(serviceAccount) }, "leadApp");
          console.log("Firebase Admin SDK (leadApp): Initialized successfully using local serviceAccountKey.json.");
          return leadAdminApp;
        } else {
           console.warn("Firebase Admin SDK (leadApp): Local serviceAccountKey.json loaded but was not a valid service account object.");
        }
    } catch (e: any) {
      console.warn(`Firebase Admin SDK (leadApp): Failed to initialize from local secrets/serviceAccountKey.json: ${e.message}.`);
    }
  }
  
  // Fallback for Google Cloud environments
  if (process.env.GOOGLE_CLOUD_PROJECT && process.env.NODE_ENV === 'production') {
    console.log("Firebase Admin SDK (leadApp): Local key file not found or invalid. Attempting Application Default Credentials for Google Cloud environment.");
     try {
        leadAdminApp = initializeApp({}, "leadApp"); // Use Application Default Credentials
        console.log("Firebase Admin SDK (leadApp): Initialized successfully with Application Default Credentials.");
        return leadAdminApp;
    } catch (e: any) {
        console.error("Firebase Admin SDK (leadApp): Error initializing with Application Default Credentials:", e.message);
    }
  }

  throw new Error("Firebase Admin SDK (leadApp): Failed to initialize. Ensure credentials (GOOGLE_APPLICATION_CREDENTIALS_JSON, local key, or ADC) are set correctly.");
}


export async function submitLeadAction(formData: FormData): Promise<ActionResult> {
  const rawData = {
    name: formData.get('name'), 
    email: formData.get('email'), 
    phone: formData.get('phone'), 
    investmentAmount: formData.get('investmentAmount'), 
    loanAmount: formData.get('loanAmount'), 
    message: formData.get('message'), 
    serviceTitle: formData.get('serviceTitle'), 
  };

   const validationResult = LeadSchema.safeParse(rawData);

   if (!validationResult.success) {
     const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
     console.error("Lead Form Validation Error:", validationResult.error.flatten());
     return { success: false, error: `Validation failed: ${errorMessages}` };
   }

    const validatedData = validationResult.data;

  try {
      const app = initializeFirebaseAdminForLead();
      const db = getFirestore(app);
      await addDoc(collection(db, "leads"), {
        ...validatedData,
        submittedAt: serverTimestamp(), 
      });

      console.log(`Lead for ${validatedData.serviceTitle} saved to Firestore:`, validatedData);
      return { success: true, data: validatedData };

  } catch (error: any) {
      console.error("Error saving lead to Firestore:", error.message);
      return { success: false, error: "Failed to save lead data due to a server error. Please try again." };
  }
}
