from flask import Flask, request, jsonify
from code_ge import generate_completion
app = Flask(__name__)

@app.route("/complete", methods=["POST"])
def complete():
    data = request.json
    prompt = data.get("selectedText", "")
    # 최대 길이 등 옵션을 추가할 수 있음
    
    print('PROMPT : ',prompt)
    completion = generate_completion(prompt)
    return jsonify({"completion": completion})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug=True)
