from transformers import AutoModelForCausalLM, AutoTokenizer
device = "cuda" # the device to load the model onto

model = AutoModelForCausalLM.from_pretrained(
    "NTQAI/Nxcode-CQ-7B-orpo",
    torch_dtype="auto",
    device_map="cuda"
)
tokenizer = AutoTokenizer.from_pretrained("NTQAI/Nxcode-CQ-7B-orpo")



    # """ Check if in given list of numbers, are any two numbers closer to each other than
    # given threshold.
    # >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    # False
    # >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    # True
    # """
    
    

def generate_completion(user_code, max_length=100):
    
    prompt = f"""
    You are a helpful AI code assistant acting like GitHub Copilot.

    I have the following Python code snippet:
    '''
    {user_code}
    '''

    Please continue writing the Python code **in place**, keeping the same indentation style and Python syntax as above.
    **DO NOT REPEAT** the snippet and DO NOT provide any explanations.
    Do **not** include any Markdown formatting or triple backticks.
    Return **only** the additional lines of code that logically follow the snippet, as **plain text** (Python code only).
    """



    messages = [
        {"role": "user", "content": prompt}
    ]

    inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to(model.device)
    outputs = model.generate(inputs, max_new_tokens=1024, do_sample=False, top_k=50, top_p=0.95, num_return_sequences=1, eos_token_id=tokenizer.eos_token_id)
    # print(inputs)
    # print(outputs)
    res = tokenizer.decode(outputs[0][len(inputs[0]):], skip_special_tokens=True)
    res = '\n'.join(res.splitlines()[2:-1])
    print(res)
    return res
if __name__ == "__main__":
    user_code = """
def make_pibonacci():

    """
    

    return_codes = generate_completion(user_code)

    print('response ::::\n',return_codes)
    
