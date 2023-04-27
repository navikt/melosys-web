import os
import re
import shutil

def contains_jsx_element(filepath, pattern):
    with open(filepath, 'r') as file:
        content = file.read()
        if re.search(pattern, content):
            return True
    return False

def rename_to_jsx(filepath):
    new_filepath = os.path.splitext(filepath)[0] + ".jsx"
    shutil.move(filepath, new_filepath)
    print(f"Renamed {filepath} to {new_filepath}")

def main():
    root_directory = '/home/isa/nav/melosys-web/'  # Change this to the desired directory
    jsx_pattern = r'<([A-Z][a-zA-Z0-9]*).*>'

    for root, _, files in os.walk(root_directory):
        for file in files:
            if file.endswith('.js'):
                filepath = os.path.join(root, file)
                if contains_jsx_element(filepath, jsx_pattern):
                    rename_to_jsx(filepath)

if __name__ == "__main__":
    main()
