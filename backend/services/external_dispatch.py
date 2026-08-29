import os
import requests
from typing import Optional

def send_twilio_sms(message: str, to_number: str) -> bool:
    """
    Sends an SMS message using Twilio SMS API.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")
    
    if not account_sid or not auth_token or not from_number:
        print("[TWILIO SMS] Configuration missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER). Skipping SMS dispatch.")
        return False
        
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    data = {
        "From": from_number,
        "To": to_number,
        "Body": message
    }
    
    try:
        print(f"[TWILIO SMS] Sending request to {to_number}...")
        response = requests.post(url, data=data, auth=(account_sid, auth_token))
        if response.status_code in [200, 201]:
            print(f"[TWILIO SMS] Success! Message sent to {to_number}.")
            return True
        else:
            print(f"[TWILIO SMS] Error: HTTP {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[TWILIO SMS] Connection error: {e}")
        return False

def send_whatsapp_message(message: str, to_number: str) -> bool:
    """
    Sends a WhatsApp message using Meta's WhatsApp Cloud API.
    Falls back to Twilio WhatsApp API if Meta credentials are not present
    but Twilio credentials are configured.
    """
    access_token = os.getenv("META_WHATSAPP_ACCESS_TOKEN")
    phone_number_id = os.getenv("META_WHATSAPP_PHONE_NUMBER_ID")
    
    # 1. Try Meta WhatsApp Cloud API if valid credentials are provided
    if access_token and phone_number_id and access_token != "mock_access_token_for_testing" and phone_number_id != "1234567890":
        url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Meta WhatsApp API expects recipient number without leading '+'
        cleaned_number = "".join(filter(str.isdigit, to_number))
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": cleaned_number,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": message
            }
        }
        
        try:
            print(f"[WHATSAPP - META] Sending request to {to_number}...")
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                print(f"[WHATSAPP - META] Success! Message sent to {to_number}.")
                return True
            else:
                print(f"[WHATSAPP - META] Error: HTTP {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"[WHATSAPP - META] Connection error: {e}")
            return False

    # 2. Fallback: Try Twilio WhatsApp API
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    
    if account_sid and auth_token:
        # Twilio Sandbox number is used as the default sender if not configured
        from_number = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        
        # Ensure 'whatsapp:' prefix for Twilio
        to_whatsapp = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number
        
        data = {
            "From": from_number,
            "To": to_whatsapp,
            "Body": message
        }
        
        try:
            print(f"[WHATSAPP - TWILIO] Sending request to {to_whatsapp} using sender {from_number}...")
            response = requests.post(url, data=data, auth=(account_sid, auth_token))
            if response.status_code in [200, 201]:
                print(f"[WHATSAPP - TWILIO] Success! Message sent to {to_whatsapp}.")
                return True
            else:
                print(f"[WHATSAPP - TWILIO] Error: HTTP {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"[WHATSAPP - TWILIO] Connection error: {e}")
            return False

    print("[WHATSAPP] Configuration missing (neither Meta WhatsApp nor Twilio credentials found). Skipping WhatsApp dispatch.")
    return False
