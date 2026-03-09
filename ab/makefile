# draw the names from the names.txt

all: names.json langcodes.json
	ct ab.ct
names.json: ../names.txt
	cut -f 1,2 ../names.txt | jdict > names.json
langcodes.json: ../names.txt
	cut -f 2,3 ../names.txt | jdict > langcodes.json
