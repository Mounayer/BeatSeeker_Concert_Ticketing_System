import pymongo
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from Utilities import utils
from django.http import HttpResponse, HttpRequest
from django.template import loader
import json
import os.path


def Concerts(request):
    template = loader.get_template("concerts.html")
    return HttpResponse(template.render())


def members(request):
    return render(request, 'seats.html')


def getSeatByID(relative_file_path):
    f = open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'concert_management\seats.json'))
    data = json.load(f)
    f.close()
    return data['seating']


def getAllConcerts(request):
    """
    api to get all Concerts in JSON format
    route: concert/api/all
    """
    return HttpResponse(json.dumps(utils.getAllConcerts()), content_type="application/json")


def getAllVenues(request):
    """
    api to get all registered Venues in JSON format
    route: concert/api/venues
    """
    return HttpResponse(json.dumps(utils.getAllVenues()), content_type="application/json")


def getConcertByCountry(request):
    """
    api to get all Concerts by Country
    route example: concert/api/bycountry/?country=Canada
    """
    queries = request.GET
    country = queries.get('country')

    if country is not None:
        concerts_sorted_by_country = list()

        for i in utils.getAllConcerts():
            if i['venue']['country'].lower() == country.lower():
                concerts_sorted_by_country.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_country), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "Query parameter was empty"
        }), content_type="application/json")


def getConcertByMostPopular(request):
    """
    api to get concerts sorted descending by times_viewed attribute
    route example: concert/api/mostpopular
    """
    concerts_sorted_by_country = sorted(utils.getAllConcerts(), key=lambda x: x['times_viewed'], reverse=True)

    return HttpResponse(json.dumps(concerts_sorted_by_country), content_type="application/json")


def getConcertByGenre(request):
    """
    api to get all Concerts by Genre
    route example: concert/api/bygenre/?genre=Hip-Hop
    """
    queries = request.GET
    genre = queries.get('genre')
    genre = genre.replace("%", " ")

    if genre is not None:
        concerts_sorted_by_genre = list()

        for i in utils.getAllConcerts():
            if i['genre'].lower() == genre.lower():
                concerts_sorted_by_genre.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_genre), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "Query parameter was empty"
        }), content_type="application/json")


def getConcertByCity(request):
    """
    api to get all Concerts by city
    route example: concert/api/bycity/?city=Toronto
    """
    queries = request.GET
    city = queries.get('city')

    if city is not None:
        concerts_sorted_by_city = list()

        for i in utils.getAllConcerts():
            if i['venue']['city'].lower() == city.lower():
                concerts_sorted_by_city.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_city), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "Query parameter was empty"
        }), content_type="application/json")


def getConcertByCityAndCountry(request):
    """
    api to get all Concerts by city and country
    route example: concert/api/bycityandcountry/?city=Toronto&country=Canada
    """
    queries = request.GET
    city = queries.get('city')
    country = queries.get('country')

    if city is not None and country is not None:
        concerts_sorted_by_city_and_country = list()

        for i in utils.getAllConcerts():
            if i['venue']['city'].lower() == city.lower() and i['venue']['country'].lower() == country.lower():
                concerts_sorted_by_city_and_country.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_city_and_country), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


def getConcertByAgeToAttendAndBelow(request):
    """
    api to get all Concerts by age to attend and below
    route example: concert/api/byage/?age=21
    """
    queries = request.GET
    age_to_attend = int(queries.get('age'))

    if age_to_attend is not None:
        concerts_sorted_by_age_to_attend = list()
        for i in utils.getAllConcerts():
            if i['age_to_attend'] <= age_to_attend:
                concerts_sorted_by_age_to_attend.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_age_to_attend), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


def getConcertByDateAndTime(request):
    """
    api to get all Concerts by date and time
    route example: concert/api/bydateandtime/?year=2011&month=12&day=10&time=19:00

    all parameters are optional, they work alone and together,
    even in a custom setting, such as:
    route example: concert/api/bydateandtime/?year=2024&time=19:00
    """
    queries = request.GET

    if queries.get('year') is not None:
        year = int(queries.get('year'))
    else:
        year = None

    if queries.get('month') is not None:
        month = int(queries.get('month'))
    else:
        month = None

    if queries.get('day') is not None:
        day = int(queries.get('day'))
    else:
        day = None

    time = queries.get('time')

    if year is not None or month is not None or day is not None or time is not None:
        concerts_sorted_by_date_and_age = []
        for i in utils.getAllConcerts():
            if (year is None or i['date']['year'] == year) and \
                    (month is None or i['date']['month'] == month) and \
                    (day is None or i['date']['day'] == day) and \
                    (time is None or i['time']['start'] == time):
                concerts_sorted_by_date_and_age.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_date_and_age), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


def getConcertDisabilityAccessibility(request):
    """
    api to get all Concerts by disability accessibility
    route example: concert/api/disability/?accessible=True
    """
    queries = request.GET
    accessible = queries.get('accessible')

    if accessible is not None:
        concerts_sorted_by_accessibility = list()

        for i in utils.getAllConcerts():
            if str(i['disability_accessible']).lower() == accessible.lower():
                concerts_sorted_by_accessibility.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_accessibility), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


def getConcertByCheapestSeatPrice(request):
    """
    api to get all Concerts cheapest seat price
    route example: concert/api/byprice/?price=232
    """
    queries = request.GET
    price = float(queries.get('price'))

    if price is not None:
        concerts_sorted_by_price = list()

        for i in utils.getAllConcerts():
            if i['venue']['cheapest_seat'] <= price:
                concerts_sorted_by_price.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_price), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


def getConcertByTopSellers(request):
    """
    api to get concerts sorted descending by top sellers
    route example: concert/api/topsellers/
    """
    concerts_sorted_by_country = sorted(utils.getAllConcerts(), key=lambda x: x['sold_tickets'], reverse=True)

    return HttpResponse(json.dumps(concerts_sorted_by_country), content_type="application/json")


def getConcertByDeals(request):
    """
    api to get all Concerts by deals
    route example: concert/api/deals/?deal=true
    """
    queries = request.GET
    deal = queries.get('deal')

    if deal is not None:
        concerts_sorted_by_deals = list()

        for i in utils.getAllConcerts():
            if str(i['deal']).lower() == deal.lower():
                concerts_sorted_by_deals.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_deals), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


def getConcertByVenue(request):
    """
    api to get all Concerts by venue name
    route example: concert/api/venue/?name=ScotiaBank%Arena
    """
    queries = request.GET
    venue_name = queries.get('name')
    venue_name = venue_name.replace("%", " ")

    if venue_name is not None:
        concerts_sorted_by_venue_name = list()

        for i in utils.getAllConcerts():
            if i['venue']['name'].lower() == venue_name.lower():
                concerts_sorted_by_venue_name.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_venue_name), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


def getConcertByPerformerName(request):
    """
    api to get all Concerts by performer name
    route example: concert/api/performername/?performername=Eminem

    another

    route example: concert/api/performername/?performername=The%Beatles
    """
    queries = request.GET
    performer_name = queries.get('performername')
    # performer_name = performer_name.replace("%", " ")

    if performer_name is not None:
        concerts_sorted_by_performer = list()

        for i in utils.getAllConcerts():
            if i['performer'].lower() == performer_name.lower():
                concerts_sorted_by_performer.append(i)

        return HttpResponse(json.dumps(concerts_sorted_by_performer), content_type="application/json")

    else:
        return HttpResponse(json.dumps({
            "message": "a Query parameter, or both, was empty"
        }), content_type="application/json")


@csrf_exempt
def CreateANewConcert(request: HttpRequest):
    """
    post API to add a concert, concert document format to be added is, example:
    concert/api/createconcert/
    """
    if request.method == 'POST':
        concert: dict = json.loads(request.body.decode('utf-8'))

        if utils.isConcertValid(concert):
            utils.getConcertsCollection().insert_one(concert)
            return HttpResponse(json.dumps({"message": "Concert Created"}))
        else:
            return HttpResponse(json.dumps({"message": 'Invalid request'}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))


def getConcertByID(request):
    """
    api to get a concert by ID:
    route example: concert/api/concertbyid/?id=1
    """
    queries = request.GET
    if queries.get('id') is not None:
        _id = int(queries.get('id'))
        if utils.getConcertsCollection().find_one({"_id": _id}) is not None:
            return HttpResponse(json.dumps(utils.getConcertsCollection().find_one({"_id": _id})),
                                content_type="application/json")
        else:
            return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")


def getNextConcertId(request):
    """
    get API to get the next concert id:
    concert/api/nextconcertid/
    """
    cursor = utils.getConcertsCollection().aggregate([
        {"$group": {"_id": None, "max_id": {"$max": "$_id"}}}])
    result = next(cursor, {})
    return HttpResponse(json.dumps({"_id": (result.get("max_id", None) + 1)}), content_type="application/json")


@csrf_exempt
def UpdateANewConcert(request: HttpRequest):
    """
    post API to update a concert:
    A concert with the same id as the one in the body will be updated
    concert/api/updateconcert/
    """
    if request.method == 'POST':
        concert: dict = json.loads(request.body.decode('utf-8'))
        if utils.isConcertValid(concert):
            utils.getConcertsCollection().replace_one({"_id": concert["_id"]}, concert)
            return HttpResponse(json.dumps({"message": "Concert Updated"}))
        else:
            return HttpResponse(json.dumps({"message": 'Invalid request'}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))


def ConcertPage(request, **kwargs):
    template = loader.get_template("concert.html")
    context = {
        'concert': utils.getConcertById(kwargs.get("id")),
    }
    return HttpResponse(template.render(context, request))


@csrf_exempt
def DeleteAConcert(request):
    """
    post API to delete a concert:
    A concert with the same id as the id in the query will be deleted
    concert/api/deleteconcert/?id=1
    """
    if request.method == 'POST':
        the_id = int(request.GET.get("id"))
        print(the_id)
        utils.getConcertsCollection().delete_one({"_id": the_id})
        return HttpResponse(json.dumps({"message": "Concert Deleted"}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))



def getNextVenueId(request):
    """
    get API to get the next venue id:
    concert/api/nextvenueid/
    """
    cursor = utils.getVenuesCollection().aggregate([
        {"$group": {"_id": None, "max_id": {"$max": "$_id"}}}])
    result = next(cursor, {})
    return HttpResponse(json.dumps({"_id": (result.get("max_id", None) + 1)}), content_type="application/json")


@csrf_exempt
def CreateANewVenue(request: HttpRequest):
    """
    post API to add a venue
    concert/api/createvenue/
    """
    if request.method == 'POST':
        venue: dict = json.loads(request.body.decode('utf-8'))
        utils.getVenuesCollection().insert_one(venue)
        return HttpResponse(json.dumps({"message": "venue created"}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))


def getVenueByID(request):
    """
    api to get a concert by ID:
    route example: concert/api/venuebyid/?id=1
    """
    queries = request.GET
    if queries.get('id') is not None:
        _id = int(queries.get('id'))
        result = utils.getVenuesCollection().find_one({"_id": _id})
        if result is not None:
            return HttpResponse(json.dumps(result), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")



@csrf_exempt
def UpdateANewVenue(request: HttpRequest):
    """
    post API to update a venue:
    A venue with the same id as the one in the body will be updated
    concert/api/updatevenue/
    """
    if request.method == 'POST':
        venue: dict = json.loads(request.body.decode('utf-8'))
        utils.getVenuesCollection().replace_one({"_id": venue["_id"]}, venue)
        return HttpResponse(json.dumps({"message": "venue updated"}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))



@csrf_exempt
def DeleteAVenue(request):
    """
    post API to delete a concert:
    A concert with the same id as the id in the query will be deleted
    concert/api/deletevenue/?id=1
    """
    if request.method == 'POST':
        the_id = int(request.GET.get("id"))
        utils.getVenuesCollection().delete_one({"_id": the_id})
        return HttpResponse(json.dumps({"message": "Venue Deleted"}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))
