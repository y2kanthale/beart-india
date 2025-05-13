
'use server';

import { z } from 'zod';
import { cert, getApps, initializeApp, App as FirebaseAdminApp } from 'firebase-admin/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Define the schema for contact form data validation
const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(5, "Message must be at least 5 characters long"),
});

interface ContactActionResult {
    success: boolean;
    error?: string;
    data?: z.infer<typeof ContactFormSchema>;
}

let contactAdminApp: FirebaseAdminApp | undefined;

function initializeFirebaseAdminForContact(): FirebaseAdminApp {
  if (contactAdminApp) {
    return contactAdminApp;
  }

  const existingApp = getApps().find(app => app.name === "contactApp");
  if (existingApp) {
    contactAdminApp = existingApp;
    return existingApp;
  }

  // Try GOOGLE_APPLICATION_CREDENTIALS_JSON (expects JSON string content)
  const credsJsonString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credsJsonString) {
    console.log("Firebase Admin SDK (contactApp): Attempting to initialize with GOOGLE_APPLICATION_CREDENTIALS_JSON.");
    try {
      const serviceAccount = JSON.parse(credsJsonString);
      if (typeof serviceAccount === 'object' && serviceAccount !== null && serviceAccount.project_id) {
        contactAdminApp = initializeApp({ credential: cert(serviceAccount) }, "contactApp");
        console.log("Firebase Admin SDK (contactApp): Initialized successfully using GOOGLE_APPLICATION_CREDENTIALS_JSON.");
        return contactAdminApp;
      } else {
        console.warn("Firebase Admin SDK (contactApp): GOOGLE_APPLICATION_CREDENTIALS_JSON parsed but was not a valid service account object.");
      }
    } catch (e: any) {
      console.warn(`Firebase Admin SDK (contactApp): Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON or initialize: ${e.message}.`);
    }
  }

  // Try local serviceAccountKey.json file as a fallback (for local dev)
  const localKeyPath = path.resolve(process.cwd(), 'secrets', 'serviceAccountKey.json');
  console.log(`Firebase Admin SDK (contactApp): GOOGLE_APPLICATION_CREDENTIALS_JSON not used or failed. Attempting local path: ${localKeyPath}`);
  if (fs.existsSync(localKeyPath)) {
    try {
      const serviceAccountFileContent = fs.readFileSync(localKeyPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountFileContent);
       if (typeof serviceAccount === 'object' && serviceAccount !== null && serviceAccount.project_id) {
        contactAdminApp = initializeApp({ credential: cert(serviceAccount) }, "contactApp");
        console.log("Firebase Admin SDK (contactApp): Initialized successfully using local serviceAccountKey.json.");
        return contactAdminApp;
      } else {
         console.warn("Firebase Admin SDK (contactApp): Local serviceAccountKey.json loaded but was not a valid service account object.");
      }
    } catch (e: any) {
      console.warn(`Firebase Admin SDK (contactApp): Failed to initialize from local secrets/serviceAccountKey.json: ${e.message}.`);
    }
  }
  
  // Fallback for Google Cloud environments if GOOGLE_APPLICATION_CREDENTIALS env var (path) is set by GCP
  // or if running on GCP with a service account attached to the resource.
  if (process.env.GOOGLE_CLOUD_PROJECT && process.env.NODE_ENV === 'production') {
    console.log(`Firebase Admin SDK (contactApp): Local key file not found or invalid. Attempting Application Default Credentials for Google Cloud environment.`);
    try {
      contactAdminApp = initializeApp({}, "contactApp"); // Uses Application Default Credentials
      console.log("Firebase Admin SDK (contactApp): Initialized successfully with Application Default Credentials.");
      return contactAdminApp;
    } catch (e: any) {
      console.error(`Firebase Admin SDK (contactApp): Error initializing with Application Default Credentials:`, e.message);
    }
  }

  throw new Error("Firebase Admin SDK (contactApp): Failed to initialize. Ensure credentials (GOOGLE_APPLICATION_CREDENTIALS_JSON, local key, or ADC) are set correctly.");
}


export async function submitContactFormAction(formData: FormData): Promise<ContactActionResult> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

   const validationResult = ContactFormSchema.safeParse(rawData);

   if (!validationResult.success) {
     const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
     console.error("Contact Form Validation Error:", validationResult.error.flatten());
     return { success: false, error: `Validation failed: ${errorMessages}` };
   }

    const validatedData = validationResult.data;

  try {
      const app = initializeFirebaseAdminForContact();
      const db = getFirestore(app);
      await addDoc(collection(db, "contacts"), {
        ...validatedData,
        submittedAt: serverTimestamp(),
      });
      console.log("Contact form data saved to Firestore:", validatedData);
      return { success: true, data: validatedData };

  } catch (error: any) {
      console.error("Error saving contact form to Firestore:", error.message);
      return { success: false, error: "Failed to process your message due to a server error. Please try again." };
  }
}
