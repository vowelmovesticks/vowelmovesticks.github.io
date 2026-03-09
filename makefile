all:
	ct indexfromnames.ct
	ct genhtml.ct
.PHONY: html
html:
	make
	bash genhtml.bash
	sh indexfromnames.sh > index.html
