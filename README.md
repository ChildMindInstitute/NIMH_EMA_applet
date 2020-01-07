# HBN_EMA_NIMH
A test repo for HBN EMA applet with NIMH content.
 
<br>

There are three applets in this repo:

### 1. master branch applet

+ This applet was converted using data_dic_noTR2.csv in the **master** branch. All single time selection questions were replaced with dropdowns
+ This applet has the ideal conditional logic in the activity_schema files
+ However, this causes a few activities to not display at all: morning_sleep_and_behavior, intake, headache<br/>


_Preview the applet here:_<br/>
https://schema-ui.anisha.pizza/#/activities/12?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhotavocado%2FHBN_EMA_NIMH%2Fmaster%2Fprotocols%2FEMA_HBN%2FEMA_HBN_schema

### 2. noCL branch applet

+ this applet has no conditional logic, visibility for all items set to `true`
+ **you should be able to preview all questions in the assessment with this applet**
+ This applet was converted using data_dic_noTR2_noCL.csv in the **noCL** branch. All single time selection questions were replaced with dropdowns<br/>

_Preview the applet here:_<br/>
https://schema-ui.anisha.pizza/#/activities/1?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhotavocado%2FHBN_EMA_NIMH%2FnoCL%2Fprotocols%2FEMA_HBN%2FEMA_HBN_schema






