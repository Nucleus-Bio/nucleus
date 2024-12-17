import os
import subprocess
import shlex
import sys
import argparse
from langchain_openai import ChatOpenAI
import re
from pydantic import BaseModel, Field

from langchain_core.prompts import ChatPromptTemplate




# Define your keyword and its specific task here
KEYWORD = "magicword"

class code(BaseModel):
        """
        Schema for code solutions for questions about tskit. 
        """
        prefix: str = Field(description="Description of the response")
        command: str = Field(description="only command as a response to the query")        

def command_tool(input_dict):
    """
    """
    try:

        llm = ChatOpenAI(
                model="gpt-4o",
                temperature=0,
                max_tokens=None,
                timeout=None,
                max_retries=2,
                api_key=input_dict['api']
            )
        
        structured_llm = llm.with_structured_output(code, include_raw=True)
        chain_raw = (
            model_prompt() | structured_llm 
        )
        return chain_raw
    except Exception as e:
        print("command_tool", e)



def load_model(input_dict):
    """
    """
    model_name = input_dict['model']
    if model_name == 'openai':
        llm = command_tool(input_dict)
        return llm
    return None

def model_prompt():
    return ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful assistant. Help users write biotools commands based on the query. \
For example: user says - convert samfile to bamfile \
ASSISTANT: To convert a SAM file to a BAM file, use the following command: \
`samtools view -S -b input.sam > output.bam`"), ("placeholder", "{messages}"),
        ]
    )



def format_message(message, role):

    if role=='user':
        return [(
            'human', message
        )]
    else:
        return [(
            'assistant', message
        )]
    

def extract_command(text):
    """
    Extracts a command from a text block surrounded by triple backticks and in bash syntax.
    
    Args:
        text (str): The input text containing the command.
        
    Returns:
        str: The extracted command, or None if no command is found.
    """
    match = re.search(r"```bash\n(.+?)```", text, re.DOTALL)
    print(match)
    if match:
        return match.group(1).strip()
    return None


def confirm_ask():
    """
    Prompt the user to decide whether to run or not.
    """
    response = input("Do you want to run? (Yes or No): ").strip().lower()
    if response in ['yes', 'y']:
        print("You chose to run!")
        return True
    elif response in ['no', 'n']:
        print("You chose not to run.")
        return False
    else:
        print("Invalid input. Please respond with 'Yes' or 'No'.")
        confirm_ask()  # Re-prompt the user

def get_response(model, user_input):
    message = {}

    message['messages'] = format_message(user_input, role='user')

    response = model.invoke(message)
    print(response['parsed'])
    command = extract_command(response.content)

    if command:
        # ask
        if confirm_ask():
            print(command)

    return response.content


def command_provider(input_dict):
    """
    Define the task to be executed when the keyword is typed.
    """
    try:

        main_model = load_model(input_dict)

        res = get_response(main_model, input_dict['message'])
        print(res)
    except Exception as e:
        print("command provider", e)

def args_parser():

    input_vals = {
     'model':'openai',
     'api':''
    }
    parser = argparse.ArgumentParser()
    parser.add_argument("--openai-api-key", help="OpenAI API Key")
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None and args.openai_api_key is None:
        print("Exception: Provide openai-api-key")
        return None
    else:
        input_vals['api'] = api_key

    return input_vals
    

def main():
    
    input_vals = args_parser()
    if not input_vals:
        return

    print("=== Custom Shell with Keyword Trigger ===")
    print("Type commands as usual. Use the keyword 'magicword' to run a specific task.")
    print("Type 'exit' or 'quit' to stop the program.\n")

    while True:
        try:
            # Prompt for user input
            user_input = input("> ").strip()

            # Check if the user wants to exit
            if user_input.lower() in ["exit", "quit"]:
                print("Exiting custom shell. Goodbye!")
                break

            if user_input.lower()[0] in "/!":
                # handle 'cd' command to change directory
                user_input = user_input[1:]
                if user_input.startswith("cd"):
                    parts = shlex.split(user_input)
                    if len(parts) > 1:
                        new_dir = parts[1]
                    else:
                        new_dir = os.path.expanduser("~")
                    try:
                        os.chdir(new_dir)
                    except FileNotFoundError:
                        print(f"cd: {new_dir}: No such file or directory")
                    except Exception as e:
                        print(f"cd: {e}")

                # Run other normal terminal commands
                else:
                    subprocess.run(shlex.split(user_input), check=False)
            else:
                input_vals['message'] = user_input
                command_provider(input_vals)
                

        except KeyboardInterrupt:
            print("\n Exiting custom shell. Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()