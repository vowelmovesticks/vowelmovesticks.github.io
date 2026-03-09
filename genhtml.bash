for file in $(ls txt/*.txt);
do
  name=$(name $file)
  lang=`echo "$name" | gawk '{ match($0, /-(...?)-/, a); print a[1]}'`
  if [[ $lang == "" ]]; then
    lang="bla"
  fi
  cat "$file" | khtml --lang "$lang" --toc "txt/$name.toc" --toc-cols 2 > "html/$name.html"
done
