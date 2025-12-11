# Test API Endpoints
param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

$baseUrl = "https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1"

Write-Host "Testing Klyr API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Payment
Write-Host "1. Creating payment..." -ForegroundColor Yellow
$paymentBody = @{
    amount = "10.00"
    currency = "USDC"
    customer_email = "test@example.com"
    description = "Test payment"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/payments" `
        -Method Post `
        -Headers @{
            "x-api-key" = $ApiKey
            "Content-Type" = "application/json"
        } `
        -Body $paymentBody

    Write-Host "Payment created successfully!" -ForegroundColor Green
    Write-Host "Payment ID: $($response.id)" -ForegroundColor White
    Write-Host "Amount: $($response.amount) $($response.currency)" -ForegroundColor White
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Payment Address: $($response.payment_address)" -ForegroundColor White
    Write-Host ""

    $paymentId = $response.id

    # Test 2: Retrieve Payment
    Write-Host "2. Retrieving payment..." -ForegroundColor Yellow
    $retrieved = Invoke-RestMethod -Uri "$baseUrl/payments/$paymentId" `
        -Method Get `
        -Headers @{"x-api-key" = $ApiKey}
    
    Write-Host "Payment retrieved: $($retrieved.status)" -ForegroundColor Green
    Write-Host ""

    # Test 3: List Payments
    Write-Host "3. Listing payments..." -ForegroundColor Yellow
    $payments = Invoke-RestMethod -Uri "$baseUrl/payments?limit=5" `
        -Method Get `
        -Headers @{"x-api-key" = $ApiKey}
    
    Write-Host "Found $($payments.total) total payments" -ForegroundColor Green
    Write-Host "Showing $($payments.data.Count) payments" -ForegroundColor White
    Write-Host ""

    # Test 4: Get Balances
    Write-Host "4. Getting balances..." -ForegroundColor Yellow
    $balances = Invoke-RestMethod -Uri "$baseUrl/balances" `
        -Method Get `
        -Headers @{"x-api-key" = $ApiKey}
    
    Write-Host "Balances:" -ForegroundColor Green
    foreach ($balance in $balances.data) {
        Write-Host "  $($balance.currency): $($balance.total)" -ForegroundColor White
    }
    Write-Host ""

    # Test 5: Create Customer
    Write-Host "5. Creating customer..." -ForegroundColor Yellow
    $customerBody = @{
        email = "newcustomer@example.com"
        name = "Test Customer"
        metadata = @{
            user_id = "12345"
        }
    } | ConvertTo-Json

    $customer = Invoke-RestMethod -Uri "$baseUrl/customers" `
        -Method Post `
        -Headers @{
            "x-api-key" = $ApiKey
            "Content-Type" = "application/json"
        } `
        -Body $customerBody
    
    Write-Host "Customer created: $($customer.id)" -ForegroundColor Green
    Write-Host ""

    # Test 6: List Customers
    Write-Host "6. Listing customers..." -ForegroundColor Yellow
    $customers = Invoke-RestMethod -Uri "$baseUrl/customers?limit=5" `
        -Method Get `
        -Headers @{"x-api-key" = $ApiKey}
    
    Write-Host "Found $($customers.total) total customers" -ForegroundColor Green
    Write-Host ""

    Write-Host "All tests passed!" -ForegroundColor Green -BackgroundColor Black
    Write-Host ""
    Write-Host "Your API is working correctly!" -ForegroundColor Cyan

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

