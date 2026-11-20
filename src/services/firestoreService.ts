import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

function generateValidId(prefix: string): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${cleanPrefix}_${timestamp}_${random}`;
}

export interface ContactInquiryInput {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ActivityReportInput {
  actionType: string;
  targetFeature?: string;
  customerName: string;
  customerEmail: string;
  details: string;
}

export interface ServiceProviderInput {
  fullName: string;
  phone: string;
  email: string;
  category: string;
  city: string;
  state: string;
  experienceYears: number;
  bio: string;
}

/**
 * Submit contact inquiry to Firestore with strict schema adherence
 */
export async function submitContactInquiry(input: ContactInquiryInput): Promise<{ id: string }> {
  const inquiryId = generateValidId('inq');
  const path = `contact_inquiries/${inquiryId}`;

  try {
    const docRef = doc(db, 'contact_inquiries', inquiryId);
    await setDoc(docRef, {
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { id: inquiryId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Submit feature activity report to Firestore
 */
export async function submitActivityReport(input: ActivityReportInput): Promise<{ id: string }> {
  const reportId = generateValidId('rep');
  const path = `activity_reports/${reportId}`;

  try {
    const docRef = doc(db, 'activity_reports', reportId);
    const payload: Record<string, unknown> = {
      actionType: input.actionType.trim(),
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      details: input.details.trim(),
      status: 'new',
      createdAt: serverTimestamp(),
    };

    if (input.targetFeature?.trim()) {
      payload.targetFeature = input.targetFeature.trim();
    }

    await setDoc(docRef, payload);
    return { id: reportId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Submit service provider registration to Firestore
 */
export async function submitServiceProviderRegistration(
  input: ServiceProviderInput
): Promise<{ id: string }> {
  const providerId = generateValidId('prov');
  const path = `service_providers/${providerId}`;

  try {
    const docRef = doc(db, 'service_providers', providerId);
    await setDoc(docRef, {
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      category: input.category.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      experienceYears: Number(input.experienceYears),
      bio: input.bio.trim(),
      status: 'pending_verification',
      createdAt: serverTimestamp(),
    });
    return { id: providerId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export interface CommunityFeedbackInput {
  testerName: string;
  role: string;
  city: string;
  category: 'trades' | 'tech' | 'mentorship' | 'general';
  rating: number;
  comment: string;
}

/**
 * Submit community feedback to Firestore
 */
export async function submitCommunityFeedback(
  input: CommunityFeedbackInput
): Promise<{ id: string }> {
  const feedbackId = generateValidId('feed');
  const path = `community_feedback/${feedbackId}`;

  try {
    const docRef = doc(db, 'community_feedback', feedbackId);
    await setDoc(docRef, {
      testerName: input.testerName.trim(),
      role: input.role.trim(),
      city: input.city.trim(),
      category: input.category,
      rating: Number(input.rating),
      comment: input.comment.trim(),
      status: 'pending_review',
      createdAt: serverTimestamp(),
    });
    return { id: feedbackId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
