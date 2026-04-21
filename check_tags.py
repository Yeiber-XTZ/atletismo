from html.parser import HTMLParser
import sys

class TagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag not in ['input', 'img', 'br', 'hr', 'meta', 'link']:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in ['input', 'img', 'br', 'hr', 'meta', 'link']:
            return
        if not self.stack:
            print(f"Error: unmatched end tag </{tag}> at line {self.getpos()[0]}")
            return
        last, pos = self.stack.pop()
        if last != tag:
            print(f"Error: expected </{last}> (opened at line {pos[0]}), but found </{tag}> at line {self.getpos()[0]}")
            # Try to recover somewhat
            if self.stack and self.stack[-1][0] == tag:
                self.stack.pop()

with open("src/pages/admin/index.astro", "r", encoding="utf-8") as f:
    text = f.read()

checker = TagChecker()
checker.feed(text)
for tag, pos in checker.stack:
    print(f"Warning: unclosed <{tag}> opened at line {pos[0]}")
