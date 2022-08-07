# Bookbinding 

Enter a pdf file and prepare it for a bookbinding process.

# Usage

1. Install the cli globally -> `npm i -g bookbinding`
2. Run the cli passing the source file as a parameter `bookbinding filename.pdf`
3. Answer the questions:
    - Does it has a cover?
    - Do you want to remove any pages, list them using `,` and `-` for ranges.
    - Do you want to crop the pdf?
    - Use default margins? Otherwise input margins
    - Input page price
4. Take all pages, crop them, create a new pdf and add them taking into account the booklet pagination. [4, 1] [2, 3]. Fill with blank pages if necesary
5. Save the output.





