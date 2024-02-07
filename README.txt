<!-- Process -->

Info:
fruit data obj: { id, name, description, limitOfFruitToBeStored, amount } //fruit.amount is defualt to 0
event data obj: { event_type, payload, is_sent, is_processed } //is_sent and is_processed is default to false

1. User calls createFruit graphql API mutation 
2. System will process the request and call the app/services, let say createFruit
   a. inside the app/services/CreateFruit, 
        i. the system will run the domain/services for validations and checker
        ii. after that the system then will run the domain/factories/FruitFactory for creatingFruit
                ii.1. it run outbox transactional event
                        1.a. will run the domain/repos/EventRepos and store the fruit data as payload
                        1.b. system will use the domain/mappers/EventMaps with a method called toDatabase() to prep the data to be saved in mongodb
                        1.c. once prep, data will be saved to the mongodb 
                        1.d. system run the domain/mappers/EventMaps with a method called toDomain() to prep the result of the db save result
                                d.i. this will now initiate a new Event entity from domain/Event from the result
                ii.2. once event is done, system will use the event._id to be 
                ii.3. this will now initiate a new Domain Fruit entity from domain/Fruit and returns it
        iii. once the FruitFactory return the Fruit entity, system then will run the domain/repos/FruitRepos
                iii.1. it will look the fruit database for any data that has same name,
                iii.2. if no same name found, system will use domain/mappers/FruitMaps with a method called toDatabase() //this will modified the data to be ready for database use
                iii.3. once mapped it will now saved to the database 
                iii.4. once saved it we will prep the data for domain and system will use domain/mappers/FruitMaps with a method called toDomain()
                        4.a. this will now initiate a new Domain Fruit entity from domain/Fruit and returns it
        iv. once the FruitRepos return the Fruit entity, system then will return the data based on that