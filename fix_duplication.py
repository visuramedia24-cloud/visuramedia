
import os

file_path = r'c:\Users\hbonj\Desktop\visura-web\visura-web-new-clean-code\src\barrierefreiheit-v2.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We want to remove lines 1487 to 1682 (inclusive, 1-based).
# In 0-based indexing:
# Line 1487 is index 1486.
# Line 1682 is index 1681.
# We want to keep lines before index 1486 (0 to 1485).
# We want to keep lines after index 1681 (1682 to end).

start_index = 1486
end_index = 1682 # The index of the first line to KEEP after the deletion

print(f"Total lines before: {len(lines)}")
print(f"Removing lines {start_index+1} to {end_index}")
print(f"Line {start_index+1}: {lines[start_index].strip()}")
print(f"Line {end_index}: {lines[end_index-1].strip()}")
print(f"Line {end_index+1}: {lines[end_index].strip()}")

new_lines = lines[:start_index] + lines[end_index:]

print(f"Total lines after: {len(new_lines)}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
