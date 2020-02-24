library(tidyverse)

dataDic <- read_csv('data_dic_new.csv')

names(dataDic)

new <- dataDic %>% mutate(Allow = ifelse(`Field Type` %in% 'radio' & is.na(multipleChoice), "autoAdvance", ''))

write_csv(new, 'data_dic_new.csv', na = '')


