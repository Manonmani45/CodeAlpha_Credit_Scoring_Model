import streamlit as st
import pickle
import numpy as np
st.set_page_config(
    page_title="Credit Risk Prediction",
    page_icon="💳",
    layout="centered"
)
st.sidebar.title("About This Project")

st.sidebar.write("""
This project predicts whether a customer is likely to have a Good or Bad Credit Risk using a Machine Learning model.

Technologies Used:
- Python
- Streamlit
- Pandas
- Scikit-learn
""")

# Load model
with open("credit_risk_model.pkl", "rb") as file:
    model = pickle.load(file)

# Page title
st.title("Credit Risk Prediction System")
st.write("Enter customer details to predict credit risk")

# 20 input features (same order as training data)

status = st.number_input("Status", 0)
duration = st.number_input("Duration", 0)
credit_history = st.number_input("Credit History", 0)
purpose = st.number_input("Purpose", 0)
amount = st.number_input("Amount", 0)
savings = st.number_input("Savings", 0)
employment_duration = st.number_input("Employment Duration", 0)
installment_rate = st.number_input("Installment Rate", 0)
personal_status = st.number_input("Personal Status", 0)
other_debtors = st.number_input("Other Debtors", 0)
present_residence = st.number_input("Present Residence", 0)
property = st.number_input("Property", 0)
age = st.number_input("Age", 0)
other_installment = st.number_input("Other Installment", 0)
housing = st.number_input("Housing", 0)
existing_credits = st.number_input("Existing Credits", 0)
job = st.number_input("Job", 0)
dependents = st.number_input("Dependents", 0)
telephone = st.number_input("Telephone", 0)
foreign_worker = st.number_input("Foreign Worker", 0)


if st.button("Predict Credit Risk"):

    input_data = np.array([
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
    ])

    input_data = input_data.reshape(1, -1)

    prediction = model.predict(input_data)

    if prediction[0] == 1:
        st.success("Credit Risk: Good")
    else:
        st.error("Credit Risk: Bad")
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