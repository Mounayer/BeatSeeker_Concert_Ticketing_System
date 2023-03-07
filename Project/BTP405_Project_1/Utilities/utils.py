from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient

mongodb = 'mongodb+srv://almnayer:n6uAlWqgtl39pvPR@django.u5zgez5.mongodb.net/?retryWrites=true&w=majority'


def get_db_handle(connection_string, db_name):
    """
    First argument is connection string
    Second argument is database name
    Returns db
    """
    client = MongoClient(connection_string)
    db = client[db_name]
    return db


def getConcertById(concert_id):
    """
    :param concert_id: the id of the concert.
    :return: concert whose id is passed.
    """
    return get_db_handle(mongodb, 'project')['Concerts'].find_one({"_id": concert_id})


def getConcertsCollection():
    """
    :return: Concert collection
    """
    return get_db_handle(mongodb, 'project')['Concerts']


def getConcertRequestsCollection():
    """
    :return: Concert collection
    """
    return get_db_handle(mongodb, 'project')['Concert_Requests']


def getVenuesCollection():
    """
    :return: Venue Collection
    """
    return get_db_handle(mongodb, 'project')["Venues"]


def getAllVenues():
    """
    :return: a list of all the concerts
    """
    db = get_db_handle(mongodb, 'project')

    return list(db['Venues'].find({}))


def getAllConcerts():
    """
    Returns a list of all the concerts
    """
    db = get_db_handle(mongodb, 'project')

    return list(db['Concerts'].find({}))


def getAllRequests():
    """
    Returns a list of all the sell ticket requests
    """
    db = get_db_handle(mongodb, 'project')

    return list(db['Concert_Requests'].find({}))


def isConcertValid(concert):
    """

    :param concert: Concert object
    :return: True if Concert object has all required attributes
    False if Concert object doesn't have all required attributes
    """
    try:
        concert["_id"]
        concert["name"]
        concert["poster"]
        concert["performer"]
        concert["sold_tickets"]
        concert["times_viewed"]
        concert["genre"]
        concert["tickets_available"]
        concert["age_to_attend"]
        concert["disability_accessible"]
        concert["deal"]
        concert["date"]
        concert["date"]["year"]
        concert["date"]["month"]
        concert["date"]["day"]
        concert["time"]
        concert["time"]["start"]
        concert["time"]["end"]
        concert["venue"]
        concert["venue"]["name"]
        concert["venue"]["country"]
        concert["venue"]["city"]
        concert["venue"]["address"]
        concert["venue"]["cheapest_seat"]
        concert["venue"]["seating"]
        concert["venue"]["seating"][0]["type"]
        concert["venue"]["seating"][0]["total"]
        concert["venue"]["seating"][0]["available_for_booking"]
        concert["venue"]["seating"][0]["available"]
        concert["venue"]["seating"][0]["sold"]
        concert["venue"]["seating"][0]["price"]
        concert["venue"]["seating"][0]["seats"]
        concert["venue"]["seating"][0]["seats"][0]["id"]
        concert["venue"]["seating"][0]["seats"][0]["vacant"]
        concert["venue"]["seating"][0]["layout"]
        concert["venue"]["seating"][0]["layout"][0]["row_num"]
        concert["venue"]["seating"][0]["layout"][0]["seats_per_row"]
    except (KeyError, NameError):
        return False

    return True


def getUserinfoCollection():
    return \
        get_db_handle(
            "mongodb+srv://aamfahim:yOgSn63p1yYBzQkf@cluster0.wdefdbm.mongodb.net/?retryWrites=true&w=majority",
            'LoginInfo')['UserInfo']


@csrf_exempt
def ChangeConcertSeats(concert, tickets, areVacant):
    c = UpdateSeatsFor(concert, tickets, areVacant)
    if isConcertValid(c):
        getConcertsCollection().replace_one({"_id": c["_id"]}, c)


def UpdateSeatsFor(c, tickets, areVacant):
    concert = getConcertById(c['id'])
    print(tickets)
    if not areVacant:
        makeTicketsTaken(concert, tickets)
        concert['tickets_available'] -= len(tickets)
        concert['sold_tickets'] += len(tickets)
    else:
        makeTicketsVacant(concert, tickets)
        concert['tickets_available'] += len(tickets)
        concert['sold_tickets'] -= len(tickets)
    return concert


def makeTicketsVacant(concert, tickets):
    for t in tickets:
        (ticketType, ticketNum) = getTicketTypeAndNumber(t['seatName'])
        seating = getSeatingOfType(concert['venue']['seating'], ticketType)
        seating['available'] += 1
        seating['sold'] -= 1
        makeSeatVacant(seating, ticketNum)


def makeTicketsTaken(concert, tickets):
    for t in tickets:
        (ticketType, ticketNum) = getTicketTypeAndNumber(t['seatName'])
        seating = getSeatingOfType(concert['venue']['seating'], ticketType)
        seating['available'] -= 1
        seating['sold'] += 1
        makeSeatTaken(seating, ticketNum)


def getUserinfoCollection():
    return get_db_handle(
        "mongodb+srv://aamfahim:yOgSn63p1yYBzQkf@cluster0.wdefdbm.mongodb.net/?retryWrites=true&w=majority",
        'LoginInfo')['UserInfo']


def makeSeatTaken(seating, ticketNum):
    purchaseSeat = getSeatWithID(seating['seats'], ticketNum)
    purchaseSeat['vacant'] = False


def makeSeatVacant(seating, ticketNum):
    purchaseSeat = getSeatWithID(seating['seats'], ticketNum)
    purchaseSeat['vacant'] = True


def getSeatWithID(seats, seatID):
    seatID = int(seatID)
    return [seat for seat in seats if seat['id'] == seatID][0]


def getCreditinfoCollection():
    return get_db_handle(
        "mongodb+srv://aamfahim:yOgSn63p1yYBzQkf@cluster0.wdefdbm.mongodb.net/?retryWrites=true&w=majority",
        'PaymentInfo')['CreditInfo']

def specifyPaymentDetails(request, info):
    request.session['payment'] = {

    }
    request.session['payment']['concert'] = info['concert']
    request.session['payment']['tickets'] = info['tickets']

    totalInCents = 0

    for t in request.session['payment']['tickets']:
        totalInCents = totalInCents + t['price'] * 100

    request.session['payment']['total'] = totalInCents

def getUserRequiredPaymentInfo(request):
    userid = request.session.get('name')
    credit_cards = list(getCreditinfoCollection().find())

    user_info = getUserinfoCollection().find_one({"$or": [{"_id": userid}, {"email": userid}]})

    credit_card = [c for c in credit_cards if c['_id'] == user_info["_id"]][0]

    users = list(getUserinfoCollection().find())
    user_info = [ui for ui in users if ui['_id'] == user_info["_id"]][0]

    month = credit_card['monthYear'][0:2]
    year = credit_card['monthYear'][2:4]

    return {'cardNumber': credit_card['credit-number'],
                         'month': month,
                         'year': year,
                         'cvc': credit_card['cvc'],
                         'email': user_info['email']}


def getTicketTypeAndNumber(ticketName):
    ticketDelimiter = '-'
    delimiterPos = ticketName.rfind(ticketDelimiter)
    return ticketName[0:delimiterPos], ticketName[delimiterPos + 1:len(ticketName)]


def getSeatingOfType(seats, ticketType):
    return [seating for seating in seats if seating['type'] == ticketType][0]


def create_purchase_history(concert, tickets, user, pay_date):
    date = str(concert['date']['year']) + '-' + str(concert['date']['month']) + '-' + str(concert['date']['day'])
    p_id = getNextPurchaseId(user)
    history = {
        "purchaseId": p_id,
        "purchaseDate": pay_date,
        "artist": concert['performer'],
        "concert": concert['name'],
        "concertDate": date,
        "start": concert['time']['start'],
        "end": concert['time']['end'],
        "venue": concert['venueName'],
        "location": concert['address']
    }

    ticket_history = []
    for i, tix in enumerate(tickets):
        ticket = {
            "ticketId": i + 1,
            "seat": tix['seatName'],
            "price": tix['price']
        }
        ticket_history.append(ticket)

    history["tickets"] = ticket_history
    getUserinfoCollection().update_one({"_id": user}, {'$push': {'purchaseHistory': history}})


def getNextPurchaseId(user):
    pipeline = [
        {"$match": {"_id": user}},
        {"$unwind": "$purchaseHistory"},
        {"$group": {"_id": None, "max_id": {"$max": "$purchaseHistory.purchaseId"}}}
    ]
    cursor = getUserinfoCollection().aggregate(pipeline)
    result = next(cursor, {})

    if result.get('max_id') is not None:
        new_id = result['max_id'] + 1
    else:
        new_id = 1

    return new_id


def getPurchaseById(user, purchase_id):
    result = getUserinfoCollection().find_one({'_id': user, 'purchaseHistory.purchaseId': purchase_id},
                                              {'purchaseHistory': {'$elemMatch': {'purchaseId': purchase_id}}})
    purchase = result['purchaseHistory'][0]
    return purchase
