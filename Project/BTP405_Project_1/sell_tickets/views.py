from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from django.http import HttpResponse, HttpRequest
from django.template import loader
from datetime import date
from Utilities import utils
import json
import os.path


def selltickets(request):
    template = loader.get_template("sell_tickets.html")
    if request.session.get('name') is not None:
        return HttpResponse(template.render())
    else:
        return redirect('/account/login')


@csrf_exempt
def requestToSellConcert(request):
    """
    post API to add a request to sell concert ticket, concert document format to be added is, example:
    selltickets/api/sellrequest/
    """
    if request.method == 'POST':
        concert: dict = json.loads(request.body.decode('utf-8'))

        if utils.isConcertValid(concert):
            concert['request_by'] = request.session.get('name')
            concert['request_on'] = str(date.today())
            utils.getConcertRequestsCollection().insert_one(concert)
            return HttpResponse(json.dumps({"message": "Concert Created"}))
        else:
            return HttpResponse(json.dumps({"message": 'Invalid request'}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))


def getRequestByID(request):
    """
    api to get a request by ID:
    route example: selltickets/api/requestbyid/?id=1
    """
    queries = request.GET
    if queries.get('id') is not None:
        _id = int(queries.get('id'))
        if utils.getConcertRequestsCollection().find_one({"_id": _id}) is not None:
            return HttpResponse(json.dumps(utils.getConcertRequestsCollection().find_one({"_id": _id})),
                                content_type="application/json")
        else:
            return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")


def getNextRequestId(request):
    """
    get API to get the next concert id:
    selltickets/api/nextrequestid/
    """
    cursor = utils.getConcertRequestsCollection().aggregate([
        {"$group": {"_id": None, "max_id": {"$max": "$_id"}}}])
    result = next(cursor, {})

    if result.get('max_id') is not None:
        new_id = result['max_id'] + 1
        print(new_id)
    else:
        new_id = 1

    return HttpResponse(json.dumps({"_id": new_id}), content_type="application/json")


def getAllRequests(request):
    """
    api to get all Concert ticket requests to be sold in JSON format
    route: selltickets/api/allrequests
    """
    return HttpResponse(json.dumps(utils.getAllRequests()), content_type="application/json")


@csrf_exempt
def requestIsOpened(request):
    """
    post API to update a request:
    A concert with the same id as the one in the body will be updated
    selltickets/api/openrequest/
    """

    if request.method == 'POST':
        concert: dict = json.loads(request.body.decode('utf-8'))
        if utils.isConcertValid(concert):
            utils.getConcertRequestsCollection().replace_one({"_id": concert["_id"]}, concert)
            return HttpResponse(json.dumps({"message": "Request Updated"}))
        else:
            return HttpResponse(json.dumps({"message": 'Invalid request'}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))


@csrf_exempt
def DeleteRequest(request):
    """
    post API to delete a request:
    A concert with the same id as the id in the query will be deleted
    selltickets/api/deleterequest/?id=1
    """
    if request.method == 'POST':
        the_id = int(request.GET.get("id"))
        utils.getConcertRequestsCollection().delete_one({"_id": the_id})
        return HttpResponse(json.dumps({"message": "Request Rejected"}))
    else:
        return HttpResponse(json.dumps({"message": "Invalid method for this API, use POST"}))
