import laya

agent = laya.load("convaiinnovations/laya")

message = input("Enter customer message: ")

state = {
    "message": message
}

questions = {
    "intent": {
        "type": "choice",
        "instructions": "What is the customer's intent?",
        "criteria": {
            "sales": "The customer wants to buy a vehicle.",
            "service": "The customer needs vehicle servicing or maintenance.",
            "complaint": "The customer is unhappy or reports a problem.",
            "Other":"The customer's message does not fit sales, service, or complaint."
        }
    }
}

print("\nINPUT:")
print(state)

result = agent.predict(state, questions)

print("\nRESULT:")
print(result)

answer = result["answers"]["intent"]

print("\n--- Prediction ---")
print("Intent:", answer["choice"])
print("Confidence:", answer["answer_confidence"] * 100, "%")
print("Probabilities:", answer["probabilities"])
print(answer["answer_confidence"])
print(answer)