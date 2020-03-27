question <- c("this is line 1 \r\n\r\n this is line 2 \r\n\r\n + this is line 3")

qlist <- as.list(str_split(question, '\r\n\r\n', simplify = T))

#add 


#if qlist > 1, 

if (length(qlist) > 1) {
  
  cat('**Question**:')

  for (i in 1:length(qlist)) {
  
    cat('\n\r\n\r\n', qlist[[i]])
  
  }

} else {
  
  print('fuck me')
  
 }

#else original

qlist2 <- map(qlist, function (x) paste0('"', x, '"'))
