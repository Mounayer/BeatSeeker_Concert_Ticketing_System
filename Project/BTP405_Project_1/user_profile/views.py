from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
from Utilities import utils
from django.shortcuts import redirect
import json


def user(request):
    if request.session.get('name') is not None:
        template = loader.get_template("user.html")

        return HttpResponse(template.render())
    else:
        return redirect('/account/login')


def user_logged_in(request):
    return request.session.get('name') is not None


def get_user_credit_card(request):
    if user_logged_in(request):
        userid = request.session.get('name')
        credit_cards = list(utils.getCreditinfoCollection().find())
        credit_card = [c for c in credit_cards if c['_id'] == userid][0]
        users = list(utils.getUserinfoCollection().find())
        user_info = [ui for ui in users if ui['_id'] == userid][0]

        month_year = credit_card['monthYear'][0:2] + ' / ' + credit_card['monthYear'][2:4]

        return JsonResponse({'cardNumber': credit_card['credit-number'],
                             'monthYear': month_year,
                             'cvc': credit_card['cvc'],
                             'email': user_info['email']})
    else:
        return JsonResponse({'status': 'Not logged in'})


def user_payment_info(request):
    userid = request.session.get('name')

    if userid is not None:
        user_info = utils.getUserinfoCollection().find_one({"$or": [{"_id": userid}, {"email": userid}]})
        creditinfo = utils.getCreditinfoCollection().find_one({"_id": user_info["_id"]})
        context = {
            'fourDigits': creditinfo['fourdigit'],
            'status': True
        }

        return HttpResponse(json.dumps(context), content_type="application/json")
    else:
        return HttpResponse(json.dumps({'status': False}), content_type="application/json")


@csrf_exempt
def update_user(request):
    if request.method == "POST":
        body_unicode = request.body.decode('UTF-8')
        body = json.loads(body_unicode)
        username = body['username']
        email = body['email']

        existing_accounts = list(utils.getUserinfoCollection().find({'$or': [{"email": email}, {"_id": username}]}))

        if len(existing_accounts) != 1:
            return JsonResponse({'status': False})

        if body['card']:
            if existing_accounts[0]["CreditInfo"] == "True":
                utils.getCreditinfoCollection().update_one({"_id": username},
                                                           {"$set": {"credit-number": body['card']['cardnum'],
                                                                     "monthYear": body['card']['expiryDate'],
                                                                     "cvc": body['card']['cvv'],
                                                                     "fourdigit": body['card']['fourdigit']}})
            else:
                new_card = {
                    "_id": username,
                    "credit-number": body['card']['cardnum'],
                    "monthYear": body['card']['expiryDate'],
                    "cvc": body['card']['cvv'],
                    "fourdigit": body['card']['fourdigit']
                }

                utils.getCreditinfoCollection().insert_one(new_card)
                utils.getUserinfoCollection().update_one({'$or': [{"email": email}, {"_id": username}]},
                                                         {'$set': {'CreditInfo': "True"}})

            updated_card = list(utils.getCreditinfoCollection().find({"_id": username}))[0]
            return JsonResponse({'status': True, 'fourdigit': updated_card['fourdigit']})
        else:
            utils.getUserinfoCollection().update_one({'$or': [{"email": email}, {"_id": username}]},
                                                     {'$set': {'email': email}})

            updated_account = list(utils.getUserinfoCollection().find({'$or': [{"email": email}, {"_id": username}]}))[
                0]
            request.session['name'] = updated_account['email']

            return JsonResponse({'status': True, 'email': updated_account['email']})


def userinfo(request):
    userid = request.session.get('name')

    if userid is not None:
        username = {"_id": userid}
        email = {"email": userid}
        userinfo = utils.getUserinfoCollection().find_one({'$or': [username, email]})
        context = {
            'name': userinfo["_id"],
            'user': userinfo,
            'credit': userinfo["CreditInfo"],
            'history': userinfo["purchaseHistory"]
        }

        if userinfo["CreditInfo"] == "True":
            creditinfo = utils.getCreditinfoCollection().find_one({"_id": userinfo["_id"]})
            context['cardno'] = creditinfo

        return HttpResponse(json.dumps(context), content_type="application/json")


def tickets(request, **kwargs):

    if request.session.get('name') is not None:
        template = loader.get_template("tickets.html")
        logged_user = request.session['name']

        user_info = utils.getUserinfoCollection().find_one({"$or": [{"_id": logged_user}, {"email": logged_user}]})

        context = {
            'tickets': utils.getPurchaseById(user_info["_id"], kwargs.get("id")),
        }
        return HttpResponse(template.render(context, request))
    else:
        return redirect('/account/login')


def getPurchaseInfo(request):
    if request.session.get('name') is not None:
        logged_user = request.session['name']

        user_info = utils.getUserinfoCollection().find_one({"$or": [{"_id": logged_user}, {"email": logged_user}]})

        queries = request.GET
        if queries.get('id') is not None:
            p_id = int(queries.get('id'))
            result = utils.getPurchaseById(user_info["_id"], p_id)
            if result is not None:
                return HttpResponse(json.dumps(result), content_type="application/json")
            else:
                return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"message": "Not Found"}), content_type="application/json")
    else:
        return redirect('/account/login')


def logout_user(request):
    if request.session.get('name') is not None:
        del request.session['name']
        del request.session['isAdmin']

    return HttpResponse(json.dumps({"message": "Logged out"}))


def isLoggedIn(request):
    if request.session.get('name') is not None:
        context = {
            "status": "Logged in",
            "isAdmin": request.session.get('isAdmin')
        }
        return HttpResponse(json.dumps(context), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"status": "Logged out"}))
