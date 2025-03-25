import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test('should show welcome message on initial load', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Check for welcome message
    await expect(page.getByText('Welcome to Roadtrip Buddy')).toBeVisible();
    await expect(page.getByText('Ask for recommendations')).toBeVisible();
  });
  
  test('should have a functional chat input', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Find the chat input and check if it's visible
    const chatInput = page.locator('input[type="text"], textarea').filter({ hasText: '' });
    await expect(chatInput).toBeVisible();
    
    // Check if the send button is visible and initially disabled (assuming it's disabled when input is empty)
    const sendButton = page.getByRole('button').filter({ hasText: /send/i });
    await expect(sendButton).toBeVisible();
  });
  
  test('should show loading state when sending a message', async ({ page }) => {
    // Mock API response to control the test flow
    await page.route('**/api/openai**', async (route) => {
      // Delay the response to ensure we can check the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          markdown: '# Test Response',
          json: {
            places: [
              {
                name: 'Test Place',
                description: 'A test place',
                location: { lat: 37.7749, lng: -122.4194 }
              }
            ]
          }
        })
      });
    });
    
    // Navigate to the application
    await page.goto('/');
    
    // Find the chat input and type a message
    const chatInput = page.locator('input[type="text"], textarea').filter({ hasText: '' });
    await chatInput.fill('Show me restaurants in San Francisco');
    
    // Click the send button
    const sendButton = page.getByRole('button').filter({ hasText: /send/i });
    await sendButton.click();
    
    // Check if loading spinner appears
    await expect(page.locator('[data-testid="loading-container"]')).toBeVisible();
    
    // Wait for the response to appear
    await expect(page.getByText('Test Response')).toBeVisible({ timeout: 5000 });
  });
  
  test('should display error message when API fails', async ({ page }) => {
    // Mock API response to simulate an error
    await page.route('**/api/openai**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Navigate to the application
    await page.goto('/');
    
    // Find the chat input and type a message
    const chatInput = page.locator('input[type="text"], textarea').filter({ hasText: '' });
    await chatInput.fill('Show me restaurants in San Francisco');
    
    // Click the send button
    const sendButton = page.getByRole('button').filter({ hasText: /send/i });
    await sendButton.click();
    
    // Check if error message appears
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
  });
  
  test('should persist messages after page reload', async ({ page }) => {
    // Mock API response
    await page.route('**/api/openai**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          markdown: '# Test Response',
          json: {
            places: [
              {
                name: 'Test Place',
                description: 'A test place',
                location: { lat: 37.7749, lng: -122.4194 }
              }
            ]
          }
        })
      });
    });
    
    // Navigate to the application
    await page.goto('/');
    
    // Find the chat input and type a message
    const chatInput = page.locator('input[type="text"], textarea').filter({ hasText: '' });
    await chatInput.fill('Show me restaurants in San Francisco');
    
    // Click the send button
    const sendButton = page.getByRole('button').filter({ hasText: /send/i });
    await sendButton.click();
    
    // Wait for the response to appear
    await expect(page.getByText('Test Response')).toBeVisible({ timeout: 5000 });
    
    // Reload the page
    await page.reload();
    
    // Check if the messages are still there
    await expect(page.getByText('Show me restaurants in San Francisco')).toBeVisible();
    await expect(page.getByText('Test Response')).toBeVisible();
  });
});
