#change to new names in conditional logic column

library(tidyverse)

dataDic <- read_csv('data_dic_new.csv')
namematch <- read_csv('namesmatch.csv')


namematch <- select(namematch, 1:2)


#create named list data dictionary to replace old names with new ones
nameDic <- setNames(paste0('\\[', namematch$name_post_v20, '\\]'), paste0('\\[', namematch$name_pre_v20, '\\]'))
#nameDic <- c("\\[Context1\\]" = "\\[since-activity-monitor\\]", "\\[Thoughts2\\]" = "\\[since-rest-fell-asleep\\]")

#replace strings

newColumn <- dataDic %>% 
  pull(`Branching Logic (Show field only if...)`) %>%
  ifelse(is.na(.), 'NA', .) %>%
  str_c(collapse = '---') %>%
  str_replace_all(nameDic) %>%
  str_split(pattern = '---', simplify = T) %>%
  ifelse(. == 'NA', NA, .) %>%
  as.character()


#replace column
dataDic <- dataDic %>%
  mutate(`Branching Logic (Show field only if...)` = newColumn) 
  
#save data dic
write_csv(dataDic, 'data_dic_new.csv', na = '')
