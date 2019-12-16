# HBN_EMA_NIMH
A test repo for HBN EMA applet with NIMH content.
 
<br>

There are three applets in this repo:

### 1. master branch applet

+ This applet was converted using data_dic_noTR.csv in the **master** branch. All single time selection questions were replaced with dropdowns
+ This applet has the ideal conditional logic in the activity_schema files
+ However, this causes a few activities to not display at all: morning_sleep_and_behavior, intake, headache<br/>


_Preview the applet here:_<br/>
https://schema-ui.anisha.pizza/#/activities/12?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhotavocado%2FHBN_EMA_NIMH%2Fmaster%2Fprotocols%2FEMA_HBN%2FEMA_HBN_schema

### 2. noCL branch applet

+ this applet has no conditional logic, visibility for all items set to `true`
+ **you should be able to preview all questions in the assessment with this applet**
+ This applet was converted using data_dic_noCL.csv in the **noCL** branch. All single time selection questions were replaced with dropdowns<br/>

_Preview the applet here:_<br/>
https://schema-ui.anisha.pizza/#/activities/1?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhotavocado%2FHBN_EMA_NIMH%2FnoCL%2Fprotocols%2FEMA_HBN%2FEMA_HBN_schema

### 3. test1 branch applet

+ This applet was converted using data_dic_noTR.csv in the **test1** branch
+ I played with the conditional logic here a bit, this applet should hopefully give more information on why conditional logic works for certain items and not others<br/>

_Preview the applet here:_<br/>
https://schema-ui.anisha.pizza/#/activities/1?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhotavocado%2FHBN_EMA_NIMH%2Ftest1%2Fprotocols%2FEMA_HBN%2FEMA_HBN_schema

<br/>


**These activities don't load at all, even though the visibility object only contains `x == y` conditions**<br/>

| activityId  | displayName | 
| ------------- | ------------- |
| headache  | Headache | 
| intake  | Food and drinks  |  

_Note: any activity with compound conditions, ie `cond1 || cond2 || cond3` will be fail to load_<br/>

visibility object for headache_schema:<br/>

   `"visibility": {
            "Headache1": true,
            "Headache1a": "Headache1 == 1",
            "Headache2": true,
            "Headache2a": "Headache2 == 0",
            "Headache2b": "Headache2 == 1",
            "Headache2d": "Headache2 == 1",
            "Headache2e": "Headache2 == 1",
            "Headache2f": "Headache2 == 1",
            "Headache2fa": "Headache2 == 1",
            "Headache2g": "Headache2 == 1",
            "Headache2h": "Headache2 == 1",
            "Headache2i": "Headache2 == 1",
            "Headache2j": "Headache2 == 1",
            "Headache2k": "Headache2 == 1",
            "Headache2l": "Headache2 == 1",
            "Headache2m": "Headache2 == 1",
            "Headache2n": "Headache2 == 1",
            "Headache2na": true,
            "Headache2o": "Headache2 == 1",
            "Headache2oa": "Headache2o == 1",
            "Headache2p": "Headache2 == 1",
            "Headache2pa": "Headache2p == 1",
            "Headache2q": "Headache2 == 1",
            "Headache2r": "Headache2 == 1"
        }`
        
visibility object for intake_schema:<br/>

 `"visibility": {
            "Intake1": true,
            "Intake1a": "Intake1 == 1",
            "Intake1b": "Intake1 == 2",
            "Intake1c": "Intake1 == 3",
            "Intake1d": "Intake1 == 3",
            "Intake1e": "Intake1 == 4",
            "Intake1f": "Intake1 == 4",
            "Intake1g": "Intake1 == 5",
            "Intake2": true,
            "Intake2a": "Intake2 == 1",
            "Intake2b": "Intake2 == 2",
            "Intake2c": "Intake2 == 3",
            "Intake2d": "Intake2 == 4",
            "Intake2e": true,
            "Intake2f": true,
            "Intake2fa": "Intake2f == 9",
            "Intake3": true,
            "Intake3a": "Intake3 == 1",
            "Intake3b": "Intake3 == 2",
            "Intake3c": "Intake3 == 3"
        }`

_Note:_ <br/>
_1. all conditions are in `x == y` form, there are no compound conditions and no other operators_ <br/>
_2. these activities show up when visibility is set to `true` for all items in the activity, see noCL branch applet_

**These conditional logic items work fine:**<br/>

| itemId | activityId | condition | question | 
| ------------- | ------------- | ------------- | ---------------------- |
| Context1a  | context_of_assessment | "Context1a": "Context1 == 1" | When did you take it off and put it back on? | 
| Thoughts2a | positive_and_negative_thoughts | "Thoughts2a": "Thoughts2 > 1" | Were these thoughts about: |
| Thoughts2b | positive_and_negative_thoughts | "Thoughts2b": "Thoughts2 > 1" | How severe or disturbing would you say these thoughts were? |
| Event4a | life_events | "Event4a": "Event4 == 1" | To what degree did this other event have a positive impact on you? |
| Event4b | life_events |  "Event4b": "Event4 == 1" | To what degree did this other event have a negative impact on you? |
| Pain1a | physical_pain | "Pain1a": "Pain1 == 1" | Where are you having pain? |
| Pain1b  | physical_pain | "Pain1b": "Pain1 == 1" | How severe is your pain right now? |
| Pain2a | physical_pain  | "Pain2a": "Pain2 == 1" | Where did this pain occur |
| Pain2b | physical_pain  |  "Pain2b": "Pain2 == 1" | How severe was the pain you experienced since the last questionnaire |
| Activity1a | physical_activity  | "Activity1a": "Activity1 == 1" | About how long was your nap or rest? |
| Activity1a | physical_activity  | "Activity1b": "Activity1 == 1" | Did you actually fall asleep during the nap or rest? |

<br/>

_Note: while `Thoughts2a` and `Thoughts2b` works fine, changing the condition for `morning11a` from `true` to `morning11 < 8` will hide the whole `morning_sleep_and_behavior` activity_

**These conditional logic items work some of the time, depending on which choice is selected from the question upstream:**<br/>

| itemId | activityId | condition | question |
| ------------- | ------------- | ---------------------- | ---------------------- |
| Activity2a  | physical_activity  |  "Activity2a": "Activity2 == 1" | When did you take it off and put it back on? | 
| Activity2b | physical_activity  | "Activity2b": "Activity2 == 1" | Were these thoughts about: |
| Activity2c | physical_activity  | "Activity2c": "Activity2 == 2" | How severe or disturbing would you say these thoughts were? |
| Activity2d | physical_activity  |  "Activity2d": "Activity2 == 2" | To what degree did this other event have a positive impact on you? |
| Activity2e | physical_activity  | "Activity2e": "Activity2 == 3" | To what degree did this other event have a negative impact on you? |
| Activity2f | physical_activity  | Activity2f": "Activity2 == 3 | Where are you having pain? |
| Daily_b3a | daily_events_and_overall_health_b  | Daily_b3a": "Daily_b3 == 1 | How much did your allergies bother you today? |
| Daily_b3b | daily_events_and_overall_health_b  | Daily_b3b": "Daily_b3 == 2 | How much did your asthma or respiratory difficulties bother you today? |
| Daily_b3c | daily_events_and_overall_health_b  | Daily_b3c": "Daily_b3 == 3 | Which (if any) of the following gastro-intestinal/stomach symptoms did you have today? |
| Daily_b3d | daily_events_and_overall_health_b  | Daily_b3d": "Daily_b3 == 3 | How much did this (or these) gastro-intestinal/stomach symptom(s) bother you today? |
| Daily_b3e  | daily_events_and_overall_health_b  | Daily_b3e": "Daily_b3 == 4 | How much did your muscle/joint pain bother you today? |
| Daily_b3f | daily_events_and_overall_health_b  | Daily_b3f": "Daily_b3 == 5 | How much did your heart racing or pounding bother you today? |
| Daily_b3g | daily_events_and_overall_health_b  | Daily_b3g": "Daily_b3 == 7 | Did these feelings occur in a particular situation (in a bus, in hot weather, or other condition?) |
| Daily_b3h | daily_events_and_overall_health_b  | Daily_b3h": "Daily_b3 == 7 | Did you actually faint today? |
| Daily_b3i | daily_events_and_overall_health_b  | Daily_b3i": "Daily_b3 == 6 | If you reported a headache present at any assessment today, how many hours did the headache(s) last in total? |
<br/>




