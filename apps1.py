import streamlit as st
import pickle
import pandas as pd
import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client
import os

# --- Configuration ---
account_sid = 'AC7c756ad93ad478d9ee29ba117b9d7af3'
auth_token = '496853750fb784688a697fe66ddbb921'
twilio_phone = '+12182506943'
recipient_phone = '+917989604033'
EMAIL_SENDER = "bhanustriver@gmail.com"
EMAIL_PASSWORD = "musfezmgchballwo"
EMAIL_RECIPIENT = "mohammedmaahin18@gmail.com"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

client = Client(account_sid, auth_token)

# --- Utility functions ---
def send_sms(message):
    try:
        client.messages.create(from_=twilio_phone, body=message, to=recipient_phone)
        st.success("✅ SMS sent!")
    except Exception as e:
        st.error(f"SMS failed: {e}")

def send_email(subject, message):
    try:
        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECIPIENT
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, EMAIL_RECIPIENT, msg.as_string())
        st.success("✅ Email sent!")
    except Exception as e:
        st.error(f"Email failed: {e}")

# --- Load models ---
@st.cache_resource
def load_models():
    return (
        pickle.load(open('crop_monitoring_model.pkl', 'rb')),
        pickle.load(open('crop_recommendation_model3.pkl', 'rb'))
    )

monitoring_model, recommendation_model = load_models()

# --- Streamlit UI ---
st.title("🌿 Unified Agriculture System")

mode = st.radio("Select Mode", ["🌡 Crop Monitoring", "🌾 Crop Recommendation"])

if mode == "🌡 Crop Monitoring":
    st.header("Monitor Field Conditions")

    temperature = st.number_input("🌡 Temperature (°C)", value=25.0)
    humidity = st.number_input("💧 Humidity (%)", value=60.0)
    soil_moisture = st.number_input("🌱 Soil Moisture", value=40.0)
    light_intensity = st.number_input("☀ Light Intensity", value=500)

    if st.button("Predict Monitoring Alerts"):
        input_df = pd.DataFrame([{
            "Temperature (°C)": temperature,
            "Humidity (%)": humidity,
            "Soil Moisture": soil_moisture,
            "Light Intensity": light_intensity
        }])
        prediction = monitoring_model.predict(input_df)[0]
        alerts = []

        if temperature > 40 or temperature < 10:
            alerts.append(f"🌡️ Temperature Alert: {temperature}°C")
        if humidity < 30 or humidity > 90:
            alerts.append(f"💧 Humidity Alert: {humidity}%")
        if soil_moisture < 20 or soil_moisture > 80:
            alerts.append(f"🌱 Soil Moisture Alert: {soil_moisture}")
        if light_intensity < 200 or light_intensity > 1000:
            alerts.append(f"☀️ Light Intensity Alert: {light_intensity}")
        if prediction == 1:
            alerts.append("🚨 AI Alert: Abnormal Field Conditions Detected")

        if alerts:
            for alert in alerts:
                st.warning(alert)
                send_sms(alert)
                send_email("Crop Monitoring Alert", alert)
        else:
            st.success("✅ All conditions normal")

elif mode == "🌾 Crop Recommendation":
    st.header("Get Crop Recommendation")

    N = st.number_input("🧪 Nitrogen (N)", value=90.0)
    P = st.number_input("🧪 Phosphorus (P)", value=40.0)
    K = st.number_input("🧪 Potassium (K)", value=43.0)
    temperature = st.number_input("🌡 Temperature (°C)", value=25.0)
    humidity = st.number_input("💧 Humidity (%)", value=80.0)
    ph = st.number_input("🌱 pH", value=6.5)
    rainfall = st.number_input("🌧 Rainfall (mm)", value=200.0)
    season = st.selectbox("🍂 Season", ["Summer", "Winter", "Autumn", "Spring", "Monsoon"])

    if st.button("Recommend Crop"):
        season_input = season.capitalize()
        season_cols = [col for col in recommendation_model.feature_names_in_ if col.startswith("season_")]
        season_data = {col: 0 for col in season_cols}
        season_col = f"season_{season_input}"
        if season_col not in season_data:
            st.error("Invalid season")
        else:
            season_data[season_col] = 1

            model_input = {
                "N": N,
                "P": P,
                "K": K,
                "temperature": temperature,
                "humidity": humidity,
                "ph": ph,
                "rainfall": rainfall,
                **season_data
            }

            input_df = pd.DataFrame([model_input])
            prediction = recommendation_model.predict(input_df)[0]

            msg = (
                f"🌾 Recommended Crop: {prediction}\n"
                f"N: {N}, P: {P}, K: {K}, Temp: {temperature}°C, Humidity: {humidity}%, "
                f"pH: {ph}, Rainfall: {rainfall}mm, Season: {season_input}"
            )

            st.success(f"🌾 Recommended Crop: {prediction}")
            send_sms(msg)
            send_email("🌾 Crop Recommendation", msg)
