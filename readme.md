# Vefforritun 2, 2022, hópverkefni 1

## heroku

https://bih1.herokuapp.com/

## Nemendur
Á github

--ivarjon
--bvf1


## Notandi

Tilbúinn admin notandi:

- username: admin
- password: 1234567890


## Test

- velja DATABASE_URL=postgres://:@localhost/h1-test í .env

- keyra
-- npm run setup
-- npm run create data
-- npm run start
-- npm run test




### Matseðill, vefþjónustur

- `/menu`
  - `GET` Skilar síðu af vörum á matseðli raðað í dagsetningar röð, nýjustu vörur fyrst

  > curl -H 'Accept: application/json' bih1.herokuapp.com/menu

  - `POST` býr til nýja vöru á matseðil ef hún er gild og notandi hefur rétt til að búa til vöru, aðeins ef notandi sem framkvæmir er stjórnandi

  > curl -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY" -F "title=banana" -F "price=15" -F "description=red apple" -F "image=@/home/bvf/programming/vef/fo.jpg" -F "category=Garden" bih1.herokuapp.com/menu

  - Tekið er við gögnum sem `form data` þar sem bæði mynd og gögn eru send inn

- `/menu?category={category}`
  - `GET` Skilar síðu af vörum í flokk, raðað í dagsetningar röð, nýjustu vörur fyrst
- `/menu?search={query}`
  - `GET` Skilar síðu af vörum þar sem `{query}` er í titli eða lýsingu, raðað í dagsetningar röð, nýjustu vörur fyrst
  - Það er hægt að senda bæði `search` og `category` í einu

  > curl -G -d 'search=Garden' -d 'description=pp' bih1.herokuapp.com/menu

- `/menu/:id`
  - `GET` sækir vöru

  > curl -H 'Accept: application/json' bih1.herokuapp.com/menu/5
curl -H 'Accept: application/json' bih1.herokuapp.com/menu/5
  - `PATCH` uppfærir vöru, aðeins ef notandi sem framkvæmir er stjórnandi

  > curl -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY" -F "title=milk" -F "category=Garden" -X PATCH bih1.herokuapp.com/menu/3


  - `DELETE` eyðir vöru, aðeins ef notandi sem framkvæmir er stjórnandi

  > url  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NDU2Nzc1LCJleHAiOjE2NDc4MTY3NzV9.8NIm8jESlzjJO49smsvCusJxLSpICEJuILYhsG0SgOk" -X DELETE bih1.herokuapp.com/menu/15

- `/categories`
  - `GET` skilar síðu af flokkum

    > curl -H 'Accept: application/json' bih1.herokuapp.com/categories

  - `POST` býr til flokk ef gildur og skilar, aðeins ef notandi sem framkvæmir er stjórnandi

  > curl -H "Content-Type: application/json" -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NDY4MDQxLCJleHAiOjE2NDc4MjgwNDF9.kDRdrgHSFxD9sCtGf6VgnY3yZOL3PiTXPAXyB29Zx9k" -d '{ "title": "appliances"}'  bih1.herokuapp.com/categories

- `/categories/:id`

  - `PATCH` uppfærir flokk, aðeins ef notandi sem framkvæmir er stjórnandi

  > curl -H "Content-Type: application/json" -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NDU2Nzc1LCJleHAiOjE2NDc4MTY3NzV9.8NIm8jESlzjJO49smsvCusJxLSpICEJuILYhsG0SgOk" -d '{ "title": "vegetables"}' -X PATCH bih1.herokuapp.com/categories/1

  - `DELETE` eyðir flokk, aðeins ef notandi sem framkvæmir er stjórnandi


  > curl  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NDU2Nzc1LCJleHAiOjE2NDc4MTY3NzV9.8NIm8jESlzjJO49smsvCusJxLSpICEJuILYhsG0SgOk" -X DELETE bih1.herokuapp.com/categories/5

### Karfa, vefþjónustur

- `/cart`
- `POST` býr til körfu og skilar
- `/cart/:cartid`
  - `GET` skilar körfu með `id` jafnt `:cartid` með öllum línum og reiknuðu heildarverði körfu
  - `POST` bætir vöru við í körfu, krefst fjölda og auðkennis á vöru
  - `DELETE` eyðir körfu með `id` jafnt `:cartid`, þarf að kalla í til að eyða körfu eftir að pöntun varð til
- `/cart/:cartid/line/:id`
  - `GET` skilar línu í körfu með `id` jafnt `:cartid` með fjölda og upplýsingum um vöru
  - `PATCH` uppfærir fjölda í línu, aðeins fyrir línu í körfu með `id` jafnt `:cartid`
  - `DELETE` eyðir línu úr körfu, aðeins fyrir línu í körfu með `id` jafnt `:cartid`

- `/orders`
  - `GET` skilar síðu af pöntunum, nýjustu pantanir fyrst, aðeins ef notandi er stjórnandi

  - `POST` býr til pöntun með viðeigandi gildum, skilar stöðu á pöntun og auðkenni

  > curl -vH "Content-Type: application/json" -d '{"name": "fine"}' bih1.herokuapp.com/orders

- `/orders/:id`
  - `GET` skilar pöntun með öllum línum, gildum pöntunar, stöðu pöntunar og reiknuðu heildarverði körfu

  > -H 'Accept: application/json' bih1.herokuapp.com/orders/85619a86-8cc3-49fb-8444-c1220c4c78c8


- `/orders/:id/status`
  - `GET` skilar pöntun með stöðu pöntunar og lista af öllum stöðubreytingum hennar
  - `POST` uppfærir stöðu pöntunar, aðeins ef notandi er stjórnandi (var upprunalega `PATCH` en `POST` á frekar við)

### Notendur, vefþjónustur

- `/users/`

  - `GET` skilar síðu af notendum, aðeins ef notandi sem framkvæmir er stjórnandi

  > curl -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY" bih1.herokuapp.com/users

- `/users/:id`

  - `GET` skilar notanda, aðeins ef notandi sem framkvæmir er stjórnandi

  > curl -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY" bih1.herokuapp.com/users/1

  - `PATCH` breytir hvort notandi sé stjórnandi eða ekki, aðeins ef notandi sem framkvæmir er stjórnandi og er ekki að breyta sér sjálfum

  > curl -H "Content-Type: application/json" -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY" -d '{ "admin": "true"}' -X PATCH bih1.herokuapp.com/users/2

- `/users/register`

  - `POST` staðfestir og býr til notanda. Skilar auðkenni og netfangi. Notandi sem búinn er til skal aldrei vera stjórnandi

  > curl -vH "Content-Type: application/json" -d '{"username": "Tommi Tómatur","email": "tommi@tomatur.is","password": "1234567890"}' bih1.herokuapp.com/users/register

- `/users/login`

  - `POST` með netfangi (eða notandanafni) og lykilorði skilar token ef gögn rétt

  > curl -vH "Content-Type: application/json" -d '{ "username": "admin", "password": "1234567890"}' POST bih1.herokuapp.com/users/login

"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY"

- `/users/me`

  - `GET` skilar upplýsingum um notanda sem á token, auðkenni og netfangi, aðeins ef notandi innskráður

  > curl -H 'Accept: application/json' "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY" bih1.herokuapp.com/users/me

  - `PATCH` uppfærir netfang, lykilorð eða bæði ef gögn rétt, aðeins ef notandi innskráður

  > curl -H "Content-Type: application/json" -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ3NjMxNzg5LCJleHAiOjE2NDc2MzUzODl9.U08xVUvDlXA6S7GjiONjwIKJ8stCBPp3ORIPv_3pWJY" -d '{ "email": "admin@admin.org"}' -X PATCH bih1.herokuapp.com/users/me


