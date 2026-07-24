import streamlit as st
import pickle
import numpy as np

# Page Configuration
st.set_page_config(
    page_title="Credit Risk Prediction",
    page_icon="💳",
    layout="centered"
)

# Sidebar
st.sidebar.title("About This Project")
st.sidebar.write("""
This project predicts whether a customer is likely to have a Good or Bad Credit Risk using a Machine Learning model.

### Technologies Used
- Python
- Streamlit
- NumPy
- Scikit-learn
""")

# Main Title
st.title("💳 Credit Risk Prediction System")
st.write("Enter customer details to predict credit risk.")

# Load Model
with open("credit_risk_model.pkl", "rb") as file:
    model = pickle.load(file)

# Input Fields
status = st.number_input("Status", min_value=0, value=0)
duration = st.number_input("Duration", min_value=0, value=0)
credit_history = st.number_input("Credit History", min_value=0, value=0)
purpose = st.number_input("Purpose", min_value=0, value=0)
amount = st.number_input("Amount", min_value=0, value=0)
savings = st.number_input("Savings", min_value=0, value=0)
employment_duration = st.number_input("Employment Duration", min_value=0, value=0)
installment_rate = st.number_input("Installment Rate", min_value=0, value=0)
personal_status = st.number_input("Personal Status", min_value=0, value=0)
other_debtors = st.number_input("Other Debtors", min_value=0, value=0)
present_residence = st.number_input("Present Residence", min_value=0, value=0)
property = st.number_input("Property", min_value=0, value=0)
age = st.number_input("Age", min_value=18, value=22)
other_installment = st.number_input("Other Installment", min_value=0, value=0)
housing = st.number_input("Housing", min_value=0, value=0)
existing_credits = st.number_input("Existing Credits", min_value=0, value=0)
job = st.number_input("Job", min_value=0, value=0)
dependents = st.number_input("Dependents", min_value=0, value=0)
telephone = st.number_input("Telephone", min_value=0, value=0)
foreign_worker = st.number_input("Foreign Worker", min_value=0, value=0)

# Predict Button
if st.button("🔍 Predict Credit Risk"):

    input_data = np.array([[
        status,
        duration,
        credit_history,
        purpose,
        amount,
        savings,
        employment_duration,
        installment_rate,
        personal_status,
        other_debtors,
        present_residence,
        property,
        age,
        other_installment,
        housing,
        existing_credits,
        job,
        dependents,
        telephone,
        foreign_worker
    ]])

    prediction = model.predict(input_data)

    if prediction[0] == 1:
        st.success("✅ Credit Risk: Good")
    else:
        st.error("❌ Credit Risk: Bad")

    st.subheader("Customer Information")

    st.write("Status:", status)
    st.write("Duration:", duration)
    st.write("Credit History:", credit_history)
    st.write("Purpose:", purpose)
    st.write("Amount:", amount)
    st.write("Savings:", savings)
    st.write("Employment Duration:", employment_duration)
    st.write("Installment Rate:", installment_rate)
    st.write("Personal Status:", personal_status)
    st.write("Other Debtors:", other_debtors)
    st.write("Present Residence:", present_residence)
    st.write("Property:", property)
    st.write("Age:", age)
    st.write("Other Installment:", other_installment)
    st.write("Housing:", housing)
    st.write("Existing Credits:", existing_credits)
    st.write("Job:", job)
    st.write("Dependents:", dependents)
    st.write("Telephone:", telephone)
    st.write("Foreign Worker:", foreign_worker)