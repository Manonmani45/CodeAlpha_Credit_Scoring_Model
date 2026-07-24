import pandas as pd

url = "https://raw.githubusercontent.com/selva86/datasets/master/GermanCredit.csv"

# Load dataset
df = pd.read_csv(url)

# Display first 5 rows
print(df.head())

# Dataset information
print("\nDataset Information:")
print(df.info())

# Check missing values
print("\nMissing Values:")
print(df.isnull().sum())

# Dataset shape
print("\nDataset Shape:")
print(df.shape)

# Display column names
print("\nColumn Names:")
print(df.columns)

# Display statistical summary
print("\nStatistical Summary:")
print(df.describe(include='all'))

# Check data types
print("\nData Types:")
print(df.dtypes)

# Check duplicate rows
print("\nDuplicate Rows:", df.duplicated().sum())

# Display target column distribution
print("\nTarget Column Distribution:")
print(df.columns)

# Check duplicate values
print("Duplicate values:")
print(df.duplicated().sum())

# Remove duplicate values
df = df.drop_duplicates()

print("Dataset shape after removing duplicates:")
print(df.shape)

# Separate features and target variable

X = df.iloc[:, :-1]   # All columns except last column
y = df.iloc[:, -1]    # Last column as target

print("Features shape:", X.shape)
print("Target shape:", y.shape)

print("Feature columns:")
print(X.columns)
print("Target values:")
print(y.head())

print("Target column name:")
print(df.columns[-1])

# Check categorical columns

categorical_columns = X.select_dtypes(include=['object']).columns

print("Categorical columns:")
print(categorical_columns)

print("Number of categorical columns:")
print(len(categorical_columns))
from sklearn.preprocessing import LabelEncoder

# Encode categorical columns
encoder = LabelEncoder()

for col in categorical_columns:
    X[col] = encoder.fit_transform(X[col])

print("After encoding:")
print(X.head())

print("Data types after encoding:")
print(X.dtypes)
from sklearn.model_selection import train_test_split

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training data shape:", X_train.shape)
print("Testing data shape:", X_test.shape)
from sklearn.linear_model import LogisticRegression

# Create model
model = LogisticRegression(max_iter=1000)

# Train model
model.fit(X_train, y_train)

print("Model training completed successfully")
from sklearn.metrics import accuracy_score, classification_report

# Make predictions
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("Model Accuracy:", accuracy)

# Detailed performance report
print("Classification Report:")
print(classification_report(y_test, y_pred))
from sklearn.ensemble import RandomForestClassifier

# Create Random Forest model
rf_model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train the model
rf_model.fit(X_train, y_train)

print("Random Forest training completed successfully")

# Prediction
rf_pred = rf_model.predict(X_test)

# Accuracy
rf_accuracy = accuracy_score(y_test, rf_pred)

print("Random Forest Accuracy:", rf_accuracy)

# Feature importance from Random Forest

import pandas as pd

importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": rf_model.feature_importances_
})

importance = importance.sort_values(
    by="Importance",
    ascending=False
)

print("Feature Importance:")
print(importance)
print(importance.head(10))
from sklearn.metrics import confusion_matrix

# Confusion matrix
cm = confusion_matrix(y_test, rf_pred)

print("Confusion Matrix:")
print(cm)
import pickle

# Save the trained Random Forest model
with open("credit_risk_model.pkl", "wb") as file:
    pickle.dump(rf_model, file)

print("Model saved successfully")

# Load saved model and make prediction

import pickle

with open("credit_risk_model.pkl", "rb") as file:
    loaded_model = pickle.load(file)

# Predict using first test data sample
sample = X_test.iloc[0].values.reshape(1, -1)

prediction = loaded_model.predict(sample)

print("Prediction result:", prediction)

if prediction[0] == 1:
    print("Credit Risk: Good")
else:
    print("Credit Risk: Bad")