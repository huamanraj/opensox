/**
 * Centralized Analytics Utility for PostHog
 * No PII (email, name) is stored - only anonymous user identifiers.
 */

import posthog from "posthog-js";

// Event Types

/**
 * All trackable event names in the application.
 * Add new events here to get type-safety across the codebase.
 */
export type AnalyticsEventName =
    // Button Click Events
    | "invest_button_clicked"
    | "button_clicked"
    // Payment Flow Events
    | "payment_initiated"
    | "payment_completed"
    | "payment_failed"
    | "subscription_started"
    // Authentication Events
    | "sign_in_started"
    | "sign_in_completed"
    | "sign_up_completed"
    // Navigation Events
    | "link_clicked"
    | "page_viewed";

// Event Properties Interfaces
/** Properties for invest_button_clicked event */
export interface InvestButtonClickedProperties {
    button_location: string;
    is_authenticated: boolean;
    plan_id?: string;
}

/** Properties for button_clicked event */
export interface ButtonClickedProperties {
    button_name: string;
    button_location: "hero" | "navbar" | "sidebar" | "cta_section" | "footer" | "mobile_menu" | string;
}

/** Properties for payment_initiated event */
export interface PaymentInitiatedProperties {
    plan_id: string;
    amount: number; // Rounded to nearest 10 for privacy
}

/** Properties for payment_completed event */
export interface PaymentCompletedProperties {
    plan_id: string;
    razorpay_order_id: string; // Last 4 chars only for privacy
}

/** Properties for payment_failed event */
export interface PaymentFailedProperties {
    plan_id: string;
    error_type: string;
    error_message?: string;
}

/** Properties for subscription_started event */
export interface SubscriptionStartedProperties {
    plan_id: string;
}

/** Properties for sign_in_started event */
export interface SignInStartedProperties {
    provider: "google" | "github";
    callback_url?: string;
}

/** Properties for sign_in_completed event */
export interface SignInCompletedProperties {
    provider: "google" | "github";
    is_new_user: boolean;
}

/** Properties for sign_up_completed event */
export interface SignUpCompletedProperties {
    provider: "google" | "github";
}

/** Properties for link_clicked event */
export interface LinkClickedProperties {
    link_url: string;
    link_text: string;
    link_location: string;
    is_external: boolean;
}

/** Properties for page_viewed event (handled by PostHogPageView) */
export interface PageViewedProperties {
    $current_url: string;
}

// Event Properties Type Map

/**
 * Maps event names to their corresponding properties interface.
 * This provides type-safety when tracking events.
 */
export interface AnalyticsEventPropertiesMap {
    invest_button_clicked: InvestButtonClickedProperties;
    button_clicked: ButtonClickedProperties;
    payment_initiated: PaymentInitiatedProperties;
    payment_completed: PaymentCompletedProperties;
    payment_failed: PaymentFailedProperties;
    subscription_started: SubscriptionStartedProperties;
    sign_in_started: SignInStartedProperties;
    sign_in_completed: SignInCompletedProperties;
    sign_up_completed: SignUpCompletedProperties;
    link_clicked: LinkClickedProperties;
    page_viewed: PageViewedProperties;
}

// Utility Functions

/**
 * Rounds amount to nearest 10 for privacy.
 * Example: 999 -> 1000, 1234 -> 1230
 */
export function sanitizeAmount(amount: number): number {
    return Math.round(amount / 10) * 10;
}

/**
 * Truncates an ID to last 4 characters for privacy.
 * Example: "order_ABC123XYZ" -> "...XYZ"
 */
export function truncateId(id: string): string {
    if (!id || id.length <= 4) return id;
    return `...${id.slice(-4)}`;
}

/**
 * Checks if PostHog is initialized and ready.
 */
export function isPostHogReady(): boolean {
    try {
        return typeof posthog !== "undefined" && posthog.__loaded === true;
    } catch {
        return false;
    }
}

// Core Analytics Functions

/**
 * Track an analytics event with type-safe properties.
 *
 * @param eventName - The name of the event to track
 * @param properties - Event properties (type-checked based on event name)
 *
 * @example
 * ```ts
 * track("button_clicked", {
 *   button_name: "Get Started",
 *   button_location: "hero"
 * });
 * ```
 */
export function track<E extends AnalyticsEventName>(
    eventName: E,
    properties: AnalyticsEventPropertiesMap[E]
): void {
    try {
        if (!isPostHogReady()) {
            if (process.env.NODE_ENV === "development") {
                console.log(`[Analytics] PostHog not ready, event skipped: ${eventName}`, properties);
            }
            return;
        }

        posthog.capture(eventName, properties);

        if (process.env.NODE_ENV === "development") {
            console.log(`[Analytics] Event tracked: ${eventName}`, properties);
        }
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error(`[Analytics] Failed to track event: ${eventName}`, error);
        }
    }
}

/**
 * Get the current anonymous distinct ID from PostHog.
 * Returns null if PostHog is not ready.
 */
export function getDistinctId(): string | null {
    try {
        if (!isPostHogReady()) {
            return null;
        }
        return posthog.get_distinct_id();
    } catch {
        return null;
    }
}

// Event-Specific Tracking Helpers

/**
 * Track an invest button click.
 */
export function trackInvestButtonClick(
    buttonLocation: string,
    isAuthenticated: boolean,
    planId?: string
): void {
    track("invest_button_clicked", {
        button_location: buttonLocation,
        is_authenticated: isAuthenticated,
        plan_id: planId,
    });
}

/**
 * Track a CTA button click.
 */
export function trackButtonClick(
    buttonName: string,
    buttonLocation: ButtonClickedProperties["button_location"]
): void {
    track("button_clicked", {
        button_name: buttonName,
        button_location: buttonLocation,
    });
}

/**
 * Track payment initiation.
 */
export function trackPaymentInitiated(planId: string, amount: number): void {
    track("payment_initiated", {
        plan_id: planId,
        amount: sanitizeAmount(amount),
    });
}

/**
 * Track successful payment completion.
 */
export function trackPaymentCompleted(planId: string, razorpayOrderId: string): void {
    track("payment_completed", {
        plan_id: planId,
        razorpay_order_id: truncateId(razorpayOrderId),
    });
}

/**
 * Track payment failure.
 */
export function trackPaymentFailed(planId: string, errorType: string, errorMessage?: string): void {
    track("payment_failed", {
        plan_id: planId,
        error_type: errorType,
        error_message: errorMessage?.substring(0, 100), // Limit error message length
    });
}

/**
 * Track subscription start.
 */
export function trackSubscriptionStarted(planId: string): void {
    track("subscription_started", {
        plan_id: planId,
    });
}

/**
 * Track sign-in start.
 */
export function trackSignInStarted(
    provider: "google" | "github",
    callbackUrl?: string
): void {
    track("sign_in_started", {
        provider,
        callback_url: callbackUrl,
    });
}

/**
 * Track sign-in completion.
 */
export function trackSignInCompleted(
    provider: "google" | "github",
    isNewUser: boolean
): void {
    track("sign_in_completed", {
        provider,
        is_new_user: isNewUser,
    });
}

/**
 * Track sign-up completion.
 */
export function trackSignUpCompleted(provider: "google" | "github"): void {
    track("sign_up_completed", {
        provider,
    });
}

/**
 * Track link click.
 */
export function trackLinkClick(
    linkUrl: string,
    linkText: string,
    linkLocation: string,
    isExternal: boolean = false
): void {
    track("link_clicked", {
        link_url: linkUrl,
        link_text: linkText,
        link_location: linkLocation,
        is_external: isExternal,
    });
}

// Analytics Object Export (Alternative API)

export const analytics = {
    track,
    getDistinctId,
    isReady: isPostHogReady,
    // Event-specific helpers
    trackInvestButtonClick,
    trackButtonClick,
    trackPaymentInitiated,
    trackPaymentCompleted,
    trackPaymentFailed,
    trackSubscriptionStarted,
    trackSignInStarted,
    trackSignInCompleted,
    trackSignUpCompleted,
    trackLinkClick,
    // Utility functions
    sanitizeAmount,
    truncateId,
};

export default analytics;
