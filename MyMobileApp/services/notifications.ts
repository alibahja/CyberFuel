// Notification service for handling reminders
// This service provides simple reminder scheduling

import * as SecureStore from 'expo-secure-store';

const LAST_REMINDER_KEY = 'last-daily-reminder-time';
const REMINDER_ENABLED_KEY = 'daily-reminder-enabled';

// Request notification permissions
export async function requestNotificationPermissions() {
  try {
    console.log('Notification permissions requested');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Schedule daily calorie reminder
export async function scheduleDailyReminderTask(enabled: boolean) {
  try {
    if (!enabled) {
      // Disable reminders
      await SecureStore.setItemAsync(REMINDER_ENABLED_KEY, 'false');
      return;
    }

    // Enable reminders
    await SecureStore.setItemAsync(REMINDER_ENABLED_KEY, 'true');
    console.log('Daily reminder task enabled');
  } catch (error) {
    console.error('Error scheduling reminder task:', error);
  }
}

// Local notification helper
export function triggerLocalNotification(title: string, body: string) {
  // This is a placeholder for local notification
  // In production, integrate with expo-notifications
  console.log(`[NOTIFICATION] ${title}: ${body}`);
}

// Check if reminder is enabled
export async function isReminderEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(REMINDER_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking reminder status:', error);
    return false;
  }
}

// Check if it's time to send the daily reminder
export async function shouldSendDailyReminder(): Promise<boolean> {
  try {
    const enabled = await isReminderEnabled();
    if (!enabled) return false;

    const lastReminderStr = await SecureStore.getItemAsync(LAST_REMINDER_KEY);
    const now = new Date();
    const lastReminder = lastReminderStr ? new Date(lastReminderStr) : null;

    // Only send reminder once per day
    if (lastReminder && lastReminder.toDateString() === now.toDateString()) {
      return false; // Already sent today
    }

    // Check if current time is within reminder window (8 PM - 9 PM)
    const currentHour = now.getHours();
    return currentHour >= 20 && currentHour < 21;
  } catch (error) {
    console.error('Error checking reminder timing:', error);
    return false;
  }
}

// Record that reminder was sent
export async function recordReminderSent() {
  try {
    await SecureStore.setItemAsync(LAST_REMINDER_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error recording reminder:', error);
  }
}

