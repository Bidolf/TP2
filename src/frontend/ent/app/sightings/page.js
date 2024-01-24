"use client";
import {useCallback, useEffect, useState} from "react";
import {
    CircularProgress,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import { useSWR } from 'swr';
import { PrismaClient } from '@prisma/client';

const API_ENT_URL = "localhost:20001"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: API_ENT_URL,
    },
  },
});

const DEMO_SIGHTINGS =  [
    {"id":"6af613b6-569c-5c22-9c37-2ed93f31d3af","ufo_shape_ref":"83b14e7c-9700-5398-a978-94eed6e96e2c","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2004-04-27","country":"United States","region":"Texas","locale":"San Marcos","latitude":"29.8830556","longitude":"-97.9411111","encounter_duration_text":"45 minutes","encounter_duration_seconds":2700,"description":"This event took place in early fall around 1949-50. It occurred after a Boy Scout meeting in the Baptist Church. The Baptist Church sit"},{"id":"b04965e6-a9bb-591f-8f8a-1adcb2c8dc39","ufo_shape_ref":"35d4f7fe-6a47-59ea-b221-c07458eefa9f","date_encounter":"1949-10-10","time_encounter":"21:00:00","season_encounter":"Autumn","date_documented":"2005-12-16","country":"United States","region":"Texas","locale":"Bexar County","latitude":"29.38421","longitude":"-98.581082","encounter_duration_text":"1-2 hrs","encounter_duration_seconds":7200,"description":"1949 Lackland AFB&#44 TX.  Lights racing across the sky &amp; making 90 degree turns on a dime."},{"id":"4b166dbe-d99d-5091-abdd-95b83330ed3a","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1955-10-10","time_encounter":"17:00:00","season_encounter":"Autumn","date_documented":"2008-01-21","country":"United Kingdom","region":"England","locale":"Chester","latitude":"53.2","longitude":"-2.916667","encounter_duration_text":"20 seconds","encounter_duration_seconds":20,"description":"Green/Orange circular disc over Chester&#44 England"},
    {"id":"98123fde-012f-5ff3-8b50-881449dac91a","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1956-10-10","time_encounter":"21:00:00","season_encounter":"Autumn","date_documented":"2004-01-17","country":"United States","region":"Texas","locale":"Edna","latitude":"28.9783333","longitude":"-96.6458333","encounter_duration_text":"1/2 hour","encounter_duration_seconds":20,"description":"My older brother and twin sister were leaving the only Edna theater at about 9 PM&#44...we had our bikes and I took a different route home"},
    {"id":"6ed955c6-506a-5343-9be4-2c0afae02eef","ufo_shape_ref":"35d4f7fe-6a47-59ea-b221-c07458eefa9f","date_encounter":"1960-10-10","time_encounter":"20:00:00","season_encounter":"Autumn","date_documented":"2004-01-22","country":"United States","region":"Hawaii","locale":"Kaneohe","latitude":"21.4180556","longitude":"-157.8036111","encounter_duration_text":"15 minutes","encounter_duration_seconds":900,"description":"AS a Marine 1st Lt. flying an FJ4B fighter/attack aircraft on a solo night exercise&#44 I was at 50&#44000&#39 in a &quot;clean&quot; aircraft (no ordinan"},
    {"id":"c8691da2-158a-5ed6-8537-0e6f140801f2","ufo_shape_ref":"af57e1bd-7240-5eda-b854-95e68ee479b3","date_encounter":"1961-10-10","time_encounter":"19:00:00","season_encounter":"Autumn","date_documented":"2007-04-27","country":"United States","region":"Tennessee","locale":"Bristol","latitude":"36.595","longitude":"-82.1888889","encounter_duration_text":"5 minutes","encounter_duration_seconds":300,"description":"My father is now 89 my brother 52 the girl with us now 51 myself 49 and the other fellow which worked with my father if he&#39s still livi"},{"id":"a6c4fc8f-6950-51de-a9ae-2c519c465071","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1965-10-10","time_encounter":"21:00:00","season_encounter":"Autumn","date_documented":"2006-02-14","country":"United Kingdom","region":"Wales","locale":"Penarth","latitude":"51.434722","longitude":"-3.18","encounter_duration_text":"about 3 mins","encounter_duration_seconds":180,"description":"penarth uk  circle  3mins  stayed 30ft above me for 3 mins slowly moved of and then with the blink of the eye the speed was unreal"},{"id":"a9f96b98-dd44-5216-ab0d-dbfc6b262edf","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1965-10-10","time_encounter":"23:45:00","season_encounter":"Autumn","date_documented":"1999-10-02","country":"United States","region":"Connecticut","locale":"Norwalk","latitude":"41.1175","longitude":"-73.4083333","encounter_duration_text":"20 minutes","encounter_duration_seconds":1200,"description":"A bright orange color changing to reddish color disk/saucer was observed hovering above power transmission lines."},
    {"id":"e99caacd-6c45-5906-bd9f-b79e62f25963","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1966-10-10","time_encounter":"20:00:00","season_encounter":"Autumn","date_documented":"2009-03-19","country":"United States","region":"Alabama","locale":"Harrisburg","latitude":"33.5861111","longitude":"-86.2861111","encounter_duration_text":"3  minutes","encounter_duration_seconds":180,"description":"Strobe Lighted disk shape object observed close&#44 at low speeds&#44 and low altitude in Oct 1966 in Pell City Alabama"},{"id":"e4d80b30-151e-51b5-9f4f-18a3b82718e6","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1966-10-10","time_encounter":"21:00:00","season_encounter":"Autumn","date_documented":"2005-05-11","country":"United States","region":"Florida","locale":"Live Oak","latitude":"30.2947222","longitude":"-82.9841667","encounter_duration_text":"several minutes","encounter_duration_seconds":120,"description":"Saucer zaps energy from powerline as my pregnant mother receives mental signals not to pass info"},{"id":"0159d6c7-973f-5e7a-a9a0-d195d0ea6fe2","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1968-10-10","time_encounter":"13:00:00","season_encounter":"Autumn","date_documented":"2003-10-31","country":"United States","region":"California","locale":"Hawthorne","latitude":"33.9163889","longitude":"-118.3516667","encounter_duration_text":"5 min.","encounter_duration_seconds":300,"description":"ROUND &#44 ORANGE &#44 WITH WHAT I WOULD SAY WAS POLISHED METAL OF SOME KIND AROUND THE EDGES ."},
    {"id":"7fef88f7-411d-5669-b42d-bf5fc7f9b58b","ufo_shape_ref":"bb23c7c4-d0a3-506d-92a6-25b3022af98a","date_encounter":"1968-10-10","time_encounter":"19:00:00","season_encounter":"Autumn","date_documented":"2008-06-12","country":"United States","region":"North Carolina","locale":"Franklin Park","latitude":"35.2333333","longitude":"-82.7344444","encounter_duration_text":"3 minutes","encounter_duration_seconds":180,"description":"silent red /orange mass of energy floated by three of us in western North Carolina in the 60s"},
    {"id":"52524d6e-10dc-5261-aa36-8b2efcbaa5f0","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1970-10-10","time_encounter":"16:00:00","season_encounter":"Autumn","date_documented":"2000-05-11","country":"United States","region":"New York","locale":"Nassau County","latitude":"40.6686111","longitude":"-73.5275","encounter_duration_text":"30 min.","encounter_duration_seconds":1800,"description":"silver disc seen by family and neighbors"},{"id":"91c274f2-9a0d-5ce6-ac3d-7529f452df21","ufo_shape_ref":"332ad0bf-a0f2-5e61-aaea-8cb024e574a3","date_encounter":"1970-10-10","time_encounter":"19:00:00","season_encounter":"Autumn","date_documented":"2008-02-14","country":"United States","region":"Kentucky","locale":"Manchester","latitude":"37.1536111","longitude":"-83.7619444","encounter_duration_text":"3 minutes","encounter_duration_seconds":180,"description":"Slow moving&#44 silent craft accelerated at an unbelievable angle and speed."},{"id":"0ff1e264-520d-543a-87dd-181a491e667e","ufo_shape_ref":"888af24e-2ed0-55cd-afe1-6bb9579d67d6","date_encounter":"1971-10-10","time_encounter":"21:00:00","season_encounter":"Autumn","date_documented":"2010-02-14","country":"United States","region":"North Carolina","locale":"South Cecil","latitude":"35.8238889","longitude":"-80.2536111","encounter_duration_text":"30 seconds","encounter_duration_seconds":30,"description":"green oval shaped light over my local church&#44power lines down.."},
    {"id":"23986425-d3a5-5e13-8bab-299745777a8d","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1972-10-10","time_encounter":"19:00:00","season_encounter":"Autumn","date_documented":"2005-09-15","country":"United States","region":"Kentucky","locale":"Harlan","latitude":"36.8430556","longitude":"-83.3219444","encounter_duration_text":"20minutes","encounter_duration_seconds":1200,"description":"On october 10&#44 1972 myself&#44my 5yrs.daughter&#442 neices and 2 nephews were playing tag in the back yard .When we looked over on the ridge"},{"id":"c15b38c9-9a3e-543c-a703-dd742f25b4d5","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1972-10-10","time_encounter":"22:30:00","season_encounter":"Autumn","date_documented":"2007-08-14","country":"United States","region":"Michigan","locale":"Bloomfield","latitude":"42.5377778","longitude":"-83.2330556","encounter_duration_text":"2 minutes","encounter_duration_seconds":120,"description":"The UFO was so close&#44 my battery in the car went to zero amps&#44 stalling the engine&#44 turning off my lights and radio."},{"id":"36eb8d4d-b854-51f1-9fdf-3735964225d5","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2005-10-31","country":"United States","region":"California","locale":"Hawthorne","latitude":"33.9188589","longitude":"-118.3483256","encounter_duration_text":"7 min.","encounter_duration_seconds":2700,"description":"ROUND &#44 ORANGE &#44 WITH WHAT I WOULD SAY WAS POLISHED METAL OF SOME KIND AROUND THE EDGES ."},
    {"id":"8f8173d9-2f8d-5636-a693-24d9f79ba651","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2007-05-11","country":"United States","region":"Florida","locale":"Live Oak","latitude":"30.2961892","longitude":"-82.9842885","encounter_duration_text":"several minutes","encounter_duration_seconds":2700,"description":"Saucer zaps energy from powerline as my pregnant mother receives mental signals not to pass info"},
    {"id":"604ed872-ae2d-5d91-8e3e-572f3a3aaaa5","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2011-03-19","country":"United States","region":"Alabama","locale":"Harrisburg","latitude":"33.5923259","longitude":"-86.2894222","encounter_duration_text":"5  minutes","encounter_duration_seconds":2700,"description":"Strobe Lighted disk shape object observed close&#44 at low speeds&#44 and low altitude in Oct 1966 in Pell City Alabama"},{"id":"f413ea13-fcd9-5b44-9d22-1fa1f7b063a5","ufo_shape_ref":"35d4f7fe-6a47-59ea-b221-c07458eefa9f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2008-12-16","country":"United States","region":"Texas","locale":"Bexar County","latitude":"29.4263987","longitude":"-98.5104781","encounter_duration_text":"4-2 hrs","encounter_duration_seconds":2700,"description":"1952 Lackland AFB&#44 TX.  Lights racing across the sky &amp; making 90 degree turns on a dime."},{"id":"f468d924-d23b-56c2-b90f-3d1cf4b45337","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2011-01-21","country":"United Kingdom","region":"England","locale":"Chester","latitude":"53.1908873","longitude":"-2.8908955","encounter_duration_text":"23 seconds","encounter_duration_seconds":2700,"description":"Green/Orange circular disc over Chester&#44 England"},
    {"id":"db680066-c83d-5ed7-89a4-1d79466ea62d","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1973-10-10","time_encounter":"19:00:00","season_encounter":"Autumn","date_documented":"2003-09-24","country":"United States","region":"Connecticut","locale":"Niantic","latitude":"41.3252778","longitude":"-72.1936111","encounter_duration_text":"20-30 min","encounter_duration_seconds":1800,"description":"Oh&#44 what a night &#33  Two (2) saucer-shaped&#44 glowing green objects and one (1) brilliantly glowing sphere gliding over the lake."},{"id":"35140057-a2a4-5adb-a500-46f8ed8b66a9","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2010-03-19","country":"United States","region":"Alabama","locale":"Harrisburg","latitude":"33.5923259","longitude":"-86.2894222","encounter_duration_text":"4  minutes","encounter_duration_seconds":2700,"description":"Strobe Lighted disk shape object observed close&#44 at low speeds&#44 and low altitude in Oct 1966 in Pell City Alabama"},{"id":"66e549b7-01e2-5d07-98d5-430f74d8d3b2","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2006-05-11","country":"United States","region":"Florida","locale":"Live Oak","latitude":"30.2961892","longitude":"-82.9842885","encounter_duration_text":"several minutes","encounter_duration_seconds":2700,"description":"Saucer zaps energy from powerline as my pregnant mother receives mental signals not to pass info"},
    {"id":"292c8e99-2378-55aa-83d8-350e0ac3f1cc","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2004-10-31","country":"United States","region":"California","locale":"Hawthorne","latitude":"33.9188589","longitude":"-118.3483256","encounter_duration_text":"6 min.","encounter_duration_seconds":2700,"description":"ROUND &#44 ORANGE &#44 WITH WHAT I WOULD SAY WAS POLISHED METAL OF SOME KIND AROUND THE EDGES ."},{"id":"0e3b230a-0509-55d8-96a0-9875f387a2be","ufo_shape_ref":"83b14e7c-9700-5398-a978-94eed6e96e2c","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2006-04-27","country":"United States","region":"Texas","locale":"San Marcos","latitude":"29.8826436","longitude":"-97.9405828","encounter_duration_text":"47 minutes","encounter_duration_seconds":2700,"description":"This event took place in early fall around 1949-50. It occurred after a Boy Scout meeting in the Baptist Church. The Baptist Church sit"},{"id":"4c507660-a83b-55c0-9b2b-83eccb07723d","ufo_shape_ref":"35d4f7fe-6a47-59ea-b221-c07458eefa9f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2007-12-16","country":"United States","region":"Texas","locale":"Bexar County","latitude":"29.4263987","longitude":"-98.5104781","encounter_duration_text":"3-2 hrs","encounter_duration_seconds":2700,"description":"1951 Lackland AFB&#44 TX.  Lights racing across the sky &amp; making 90 degree turns on a dime."},
    {"id":"a1b9b633-da11-58be-b1a9-5cfa2848f186","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2010-01-21","country":"United Kingdom","region":"England","locale":"Chester","latitude":"53.1908873","longitude":"-2.8908955","encounter_duration_text":"22 seconds","encounter_duration_seconds":2700,"description":"Green/Orange circular disc over Chester&#44 England"},
    {"id":"e7263999-68b6-5a23-b530-af25b7efd632","ufo_shape_ref":"35d4f7fe-6a47-59ea-b221-c07458eefa9f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2006-01-22","country":"United States","region":"Hawaii","locale":"Kaneohe","latitude":"21.418555","longitude":"-157.804184","encounter_duration_text":"17 minutes","encounter_duration_seconds":2700,"description":"AS a Marine 1st Lt. flying an FJ4B fighter/attack aircraft on a solo night exercise&#44 I was at 50&#44000&#39 in a &quot;clean&quot; aircraft (no ordinan"},{"id":"ce1ae2d5-3454-5952-97ff-36ff935bcfe9","ufo_shape_ref":"af57e1bd-7240-5eda-b854-95e68ee479b3","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2009-04-27","country":"United States","region":"Tennessee","locale":"Bristol","latitude":"36.5945034","longitude":"-82.1885212","encounter_duration_text":"7 minutes","encounter_duration_seconds":2700,"description":"My father is now 89 my brother 52 the girl with us now 51 myself 49 and the other fellow which worked with my father if he&#39s still livi"},{"id":"33677b87-bc8d-5ff6-9a25-fe60225e4bf0","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2008-02-14","country":"United Kingdom","region":"Wales","locale":"Penarth","latitude":"51.435968","longitude":"-3.1733023","encounter_duration_text":"about 3 mins","encounter_duration_seconds":2700,"description":"penarth uk  circle  3mins  stayed 30ft above me for 3 mins slowly moved of and then with the blink of the eye the speed was unreal"},
    {"id":"ed2305ae-e8f9-5387-b860-3d80ae6c02f7","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2001-10-02","country":"United States","region":"Connecticut","locale":"Norwalk","latitude":"41.1175966","longitude":"-73.4078968","encounter_duration_text":"22 minutes","encounter_duration_seconds":2700,"description":"A bright orange color changing to reddish color disk/saucer was observed hovering above power transmission lines."},{"id":"8828c9d6-ed76-5c09-bf64-ba9e9cd90896","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2007-01-17","country":"United States","region":"Texas","locale":"Edna","latitude":"28.9772626","longitude":"-96.6462526","encounter_duration_text":"4/2 hour","encounter_duration_seconds":2700,"description":"My older brother and twin sister were leaving the only Edna theater at about 9 PM&#44...we had our bikes and I took a different route home"},{"id":"facb7618-55ca-5c30-9cba-fd567b6c0611","ufo_shape_ref":"35d4f7fe-6a47-59ea-b221-c07458eefa9f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2007-01-22","country":"United States","region":"Hawaii","locale":"Kaneohe","latitude":"21.418555","longitude":"-157.804184","encounter_duration_text":"18 minutes","encounter_duration_seconds":2700,"description":"AS a Marine 1st Lt. flying an FJ4B fighter/attack aircraft on a solo night exercise&#44 I was at 50&#44000&#39 in a &quot;clean&quot; aircraft (no ordinan"},
    {"id":"96f3de0e-6412-5434-b406-67ef3352ab85","ufo_shape_ref":"af57e1bd-7240-5eda-b854-95e68ee479b3","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2010-04-27","country":"United States","region":"Tennessee","locale":"Bristol","latitude":"36.5945034","longitude":"-82.1885212","encounter_duration_text":"8 minutes","encounter_duration_seconds":2700,"description":"My father is now 89 my brother 52 the girl with us now 51 myself 49 and the other fellow which worked with my father if he&#39s still livi"},{"id":"9ebacb89-40ab-52b3-93a2-9054611d8f55","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2009-02-14","country":"United Kingdom","region":"Wales","locale":"Penarth","latitude":"51.435968","longitude":"-3.1733023","encounter_duration_text":"about 3 mins","encounter_duration_seconds":2700,"description":"penarth uk  circle  3mins  stayed 30ft above me for 3 mins slowly moved of and then with the blink of the eye the speed was unreal"},{"id":"681046ff-9129-5ade-b11c-769864e02184","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2002-10-02","country":"United States","region":"Connecticut","locale":"Norwalk","latitude":"41.1175966","longitude":"-73.4078968","encounter_duration_text":"23 minutes","encounter_duration_seconds":2700,"description":"A bright orange color changing to reddish color disk/saucer was observed hovering above power transmission lines."},
    {"id":"7c411b5e-9d3f-50b5-9c28-62096e41c4ed","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2008-05-11","country":"United States","region":"Florida","locale":"Live Oak","latitude":"30.2961892","longitude":"-82.9842885","encounter_duration_text":"several minutes","encounter_duration_seconds":2700,"description":"Saucer zaps energy from powerline as my pregnant mother receives mental signals not to pass info"},{"id":"f825aafe-6696-5121-b263-6b2c408b7f43","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2006-10-31","country":"United States","region":"California","locale":"Hawthorne","latitude":"33.9188589","longitude":"-118.3483256","encounter_duration_text":"8 min.","encounter_duration_seconds":2700,"description":"ROUND &#44 ORANGE &#44 WITH WHAT I WOULD SAY WAS POLISHED METAL OF SOME KIND AROUND THE EDGES ."},{"id":"f2b4caea-61c3-5bed-8ce7-d8b9d16e129e","ufo_shape_ref":"83b14e7c-9700-5398-a978-94eed6e96e2c","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2008-04-27","country":"United States","region":"Texas","locale":"San Marcos","latitude":"29.8826436","longitude":"-97.9405828","encounter_duration_text":"49 minutes","encounter_duration_seconds":2700,"description":"This event took place in early fall around 1949-50. It occurred after a Boy Scout meeting in the Baptist Church. The Baptist Church sit"},
    {"id":"3593855a-6557-5736-8cab-172c6987f949","ufo_shape_ref":"35d4f7fe-6a47-59ea-b221-c07458eefa9f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2009-12-16","country":"United States","region":"Texas","locale":"Bexar County","latitude":"29.4263987","longitude":"-98.5104781","encounter_duration_text":"5-2 hrs","encounter_duration_seconds":2700,"description":"1953 Lackland AFB&#44 TX.  Lights racing across the sky &amp; making 90 degree turns on a dime."},
    {"id":"3493b6ca-f84b-56a9-97cc-c0bd1c46c4c0","ufo_shape_ref":"83b14e7c-9700-5398-a978-94eed6e96e2c","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2007-04-27","country":"United States","region":"Texas","locale":"San Marcos","latitude":"29.8826436","longitude":"-97.9405828","encounter_duration_text":"48 minutes","encounter_duration_seconds":2700,"description":"This event took place in early fall around 1949-50. It occurred after a Boy Scout meeting in the Baptist Church. The Baptist Church sit"},{"id":"cadb7952-2bba-5609-88d4-8e47ec4e7920","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2000-10-02","country":"United States","region":"Connecticut","locale":"Norwalk","latitude":"41.1175966","longitude":"-73.4078968","encounter_duration_text":"21 minutes","encounter_duration_seconds":2700,"description":"A bright orange color changing to reddish color disk/saucer was observed hovering above power transmission lines."},{"id":"c2708a8b-120a-56f5-a30d-990048af87cc","ufo_shape_ref":"5930cafe-f51b-5140-a33b-5efb5393bdff","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2006-01-17","country":"United States","region":"Texas","locale":"Edna","latitude":"28.9772626","longitude":"-96.6462526","encounter_duration_text":"3/2 hour","encounter_duration_seconds":2700,"description":"My older brother and twin sister were leaving the only Edna theater at about 9 PM&#44...we had our bikes and I took a different route home"},
    {"id":"c13d0b5d-1ca3-57b6-a23f-8586bca44928","ufo_shape_ref":"f242894e-9b1a-5faa-9bb4-9be9fa449a4f","date_encounter":"1949-10-10","time_encounter":"20:30:00","season_encounter":"Autumn","date_documented":"2012-03-19","country":"United States","region":"Alabama","locale":"Harrisburg","latitude":"33.5923259","longitude":"-86.2894222","encounter_duration_text":"6  minutes","encounter_duration_seconds":2700,"description":"Strobe Lighted disk shape object observed close&#44 at low speeds&#44 and low altitude in Oct 1966 in Pell City Alabama"}
];

export async function getSightings() {
  const sightings = await prisma.sighting.findMany({
    where: {
      ufo_shape_ref: '83b14e7c-9700-5398-a978-94eed6e96e2c',
      // Add more conditions if needed
    },
  });

  return {
    props: {
      sightings,
    },
  };
}

const fetcher = async (url) => {
  const response = await fetch(url);
  return response.json();
};
const useCustomFetch = (query) => {
  const { data, error } = useSWR(query, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default function SightingsPage({sightings}) {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams)
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    );
    const [data, setData] = useState(null);
    const [maxDataSize, setMaxDataSize] = useState(DEMO_SIGHTINGS.length);

    const page = parseInt(searchParams.get('page')) || 1;
    const PAGE_SIZE = 10;

    useEffect(() => {
        //!FIXME: this is to simulate how to retrieve data from the server
        //!FIXME: the entities server URL is available on process.env.REACT_APP_API_ENTITIES_URL
        setData(null);

        const { data, isLoading, isError } = useCustomFetch('/api/data');
        setData(data)

//        prisma.sighting
//            .findMany({
//                take: PAGE_SIZE,
//                skip: (page - 1) * PAGE_SIZE,
//                // Add any other necessary conditions or sorting here
//            })
//            .then((result) => {
//                setData(result);
//            })
//            .catch((error) => {
//                console.error('Error fetching data from Prisma:', error);
//        });

//        setTimeout(() => {
//            console.log(`fetching from ${API_ENT_URL}`)
//            setData(DEMO_SIGHTINGS.filter((item, index) => Math.floor(index / PAGE_SIZE) === (page - 1)));
//        }, 500);
    }, [page])

    return (
        <>
            <h1 sx={{fontSize: "100px"}}>Players</h1>

            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="simple table">
                    <TableHead>
                        <TableRow sx={{backgroundColor: "lightgray"}}>
                            <TableCell component="th" width={"1px"} align="center">ID</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="center">Age</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            data ?
                                data.map((row) => (
                                    <TableRow
                                        key={row.id}
                                    >
                                        <TableCell component="td" align="center">{row.id}</TableCell>
                                        <TableCell component="td" scope="row">
                                            {row.description}
                                        </TableCell>
                                        <TableCell component="td" align="center" scope="row">
                                            {row.date_encounter}
                                        </TableCell>
                                    </TableRow>
                                ))
                                :
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <CircularProgress/>
                                    </TableCell>
                                </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {
                maxDataSize && <Pagination style={{color: "black", marginTop: 8}}
                                           variant="outlined" shape="rounded"
                                           color={"primary"}
                                           onChange={(e, v) => {
                                               router.push(pathname + '?' + createQueryString('page', v))
                                           }}
                                           page={page}
                                           count={Math.ceil(maxDataSize / PAGE_SIZE)}
                />
            }


        </>
    );
}
