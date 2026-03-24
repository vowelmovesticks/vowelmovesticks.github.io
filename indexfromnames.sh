#rm index.tmp
cat names.txt | awk -F '\t' '{ print $1 "&nbsp;&nbsp;<a href=\"html/" $2 ".html\">read</a>&nbsp;&nbsp;<a href=\"ab/?a=" $2 "&b=bib-orig&ww_b=true&tlit_b=true\">bilingual</a>&nbsp;&nbsp;<a href=\"txt/" $2 ".txt\">txt</a> <br>"}' >> index.tmp
cat blurb.html index.tmp bottom.html | htmlwrap "yeah os" 
rm index.tmp
