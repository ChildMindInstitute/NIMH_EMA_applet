library(tidyverse)

#####refactor activities
dataDic <- read_csv('data_dic_noTR.csv')

##create Form name, Form display name, Form note
formInfo <- function (data, formName, formDisplay, formNote) {
 
   new <- data %>% mutate(`Form Name` = formName,
                          `Form Display Name` = formDisplay,
                          `Form Note` = formNote)
  
  return(new)

}



#create morning set
morningSet <- filter(dataDic, schedule %in% c('morning_questions','all_day_questions'))
formName = 'morning_set'
formDisplay = 'EMA Assessment'
formNote = 'A morning questionnaire'
morningSet <- formInfo(morningSet, formName, formDisplay, formNote)

#create all day set
daySet <- filter(dataDic, schedule == 'all_day_questions')
formName = 'day_set'
formDisplay = 'EMA Assessment'
formNote = 'A mid-day questionnaire'
daySet <- formInfo(daySet, formName, formDisplay, formNote)


#create evening set
eveningSet <- filter(dataDic, schedule %in% c('all_day_questions', 'evening_questions'))
formName = 'evening_set'
formDisplay = 'EMA Assessment'
formNote = 'An evening questionnaire'
eveningSet <- formInfo(eveningSet, formName, formDisplay, formNote)

#create prequestionnaire
preQ <- filter(dataDic, schedule == 'pre_questionnaire')
formName = 'pre_questionnaire'
formDisplay = 'Pre-Questionnaire'
formNote = 'Pre-assessment questions'
preQ<- formInfo(preQ, formName, formDisplay, formNote)


#rbind them 
dataDicNew <- do.call('rbind', list(preQ, morningSet, daySet, eveningSet))


write_csv(dataDicNew, 'data_dic_noTR2.csv', na = '')




