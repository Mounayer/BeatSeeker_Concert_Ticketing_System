import json
from django.views.decorators.cache import never_cache
from django.contrib import messages
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from Utilities import utils
from datetime import date
import bcrypt
import random
import pycountry
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.contrib import messages

# Create your views here.


def members(request):
    template = loader.get_template("account.html")
    return HttpResponse(template.render())


@csrf_exempt
def reset(request):
    """display a form with email and reset code input to verify email"""
    template = loader.get_template("email.html")
    if request.method == "POST":
        form = request.POST.dict()
        request.session["email"] = form["email"]
        return redirect("/account/resetpassword")

    return HttpResponse(template.render())


def generatecode():
    """generates 6 digit code"""
    number = random.randint(100000, 999999)
    return number


def sendcode(request):
    """API to send 6 digit to registered email address"""
    queries = request.GET
    email = queries.get("email")
    result = utils.getUserinfoCollection().find_one({"email": email})
    if result is not None:
        number = generatecode()
        request.session["confirmationcode"] = number
        send_mail("BeatSeeker Password Reset Code",
                  f'Your confrimation code is: {number}',
                  settings.EMAIL_HOST_USER,
                  [email])
        return HttpResponse(json.dumps({"message": "True"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")


def matchcode(request):
    """API to check match of user inputted and system generated code"""
    queries = request.GET
    qcode = int(queries.get("code"))
    code = request.session.get("confirmationcode")
    if code == qcode:
        return HttpResponse(json.dumps({"message": "True"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")


@csrf_exempt
def resetpassword(request):
    """display html page to input new password once email is verified"""
    if request.session.get("confirmationcode") is not None:
        template = loader.get_template("resetpassword.html")
        if request.method == "POST":
            del request.session["confirmationcode"]
            return redirect("/account/login")
        return HttpResponse(template.render())
    else:
        return redirect('/account/reset')

def updatepassword(request):
    """API to update the password for the requested email address"""
    queries = request.GET
    password = queries.get("password")
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    password = hashed_password.decode()
    email = request.session.get("email")
    user = utils.getUserinfoCollection().find_one({"email": email})

    if user is not None:
        user["password"] = password
        utils.getUserinfoCollection().update_one({"email": email}, {"$set": {"password": password}})
        del request.session["email"]
        return HttpResponse(json.dumps({"message": "True"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")


@csrf_exempt
@never_cache
def login(request):
    if request.session.get('name') is None:
        template = loader.get_template("login.html")
        if request.method == 'POST':
            form = request.POST.dict()
            request.session['name'] = form['name']
            username = {"_id": form['name']}
            email = {"email": form['name']}
            userinfo = utils.getUserinfoCollection().find_one({'$or': [username, email]})
            request.session['isAdmin'] = userinfo["Admin"]

            if not userinfo["Admin"]:
                return redirect('/user')
            else:
                return redirect('/account/admin/')
            # return HttpResponse(json.dumps(form), content_type="application/json")
        else:
            return HttpResponse(template.render())
    else:
        if request.session.get('isAdmin'):
            return redirect('/account/admin/')
        else:
            return redirect('/user')


@csrf_exempt
def register(request: HttpRequest):
    """display register page"""
    template = loader.get_template("register.html")

    if request.method == "POST":
        form = request.POST.dict()
        form = cleandictionary(form)
        userinfo, creditinfo = divideUserinfo(form)
        context = {
            "redirect": "redirect",
            "created": "created"
        }

        utils.getUserinfoCollection().insert_one(userinfo)
        if userinfo["CreditInfo"] == "True":
            utils.getCreditinfoCollection().insert_one(creditinfo)
        return HttpResponse(template.render(context, request))

    return HttpResponse(template.render())


def code_to_country_name(code):
    country = pycountry.countries.get(alpha_2=code.upper())
    return country.name


def cleandictionary(form):
    """
    :param form: takes the dictionary returned by the form.
    :return: a new form with encoded password, credit card information[if any], removed repeat password.
    """
    hashed_password = bcrypt.hashpw(form["password"].encode(), bcrypt.gensalt())
    form["password"] = hashed_password.decode()
    del form["repeatPassword"]
    form['country'] = code_to_country_name(form['country'])
    if "CreditInfo" in form:
        form["fourdigit"] = form["credit-number"][-4:]
    else:
        form["fourdigit"] = ""
        form["CreditInfo"] = "False"

    return form


def divideUserinfo(form):
    """divide the given form(dictionary) into two separated dictionary and return"""
    userinfo = {"_id": form["username"], "email": form["email"], "password": form["password"], "country": form["country"], "CreditInfo": form["CreditInfo"], "Created": str(date.today()), "Admin": False, "purchaseHistory": []}
    creditinfo = {"_id": form["username"], "credit-number": form["credit-number"], "monthYear": form["monthYear"], "cvc": form["cvc"], "fourdigit": form["fourdigit"]}

    return userinfo, creditinfo


def usernameunique(request):
    """API to check if the username already exists in the database"""
    queries = request.GET
    name = queries.get("username")
    result = utils.getUserinfoCollection().find_one({"_id": name})
    if result is not None:
        return HttpResponse(json.dumps({"message": "True"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")

def emailunique(request):
    """API to check if the email already exists in the database"""
    queries = request.GET
    email = queries.get("email")
    result = utils.getUserinfoCollection().find_one({"email": email})
    if result is not None:
        return HttpResponse(json.dumps({"message": "True"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")


def usernamelogin(request):
    """API to check if given username and password match with the one in the database"""
    queries = request.GET
    name = queries.get("username")
    password = queries.get("password")
    result = utils.getUserinfoCollection().find_one({"_id": name})
    if result is not None:
        if bcrypt.checkpw(password.encode("utf-8"), result["password"].encode("utf-8")):
            return HttpResponse(json.dumps({"message": "True"}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")


def emaillogin(request):
    """API to check if given email and password match with the one in the database"""
    queries = request.GET
    email = queries.get("email")
    password = queries.get("password")
    result = utils.getUserinfoCollection().find_one({"email": email})
    if result is not None:
        if bcrypt.checkpw(password.encode("utf-8"), result["password"].encode("utf-8")):
            return HttpResponse(json.dumps({"message": "True"}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"message": "False"}), content_type="application/json")



def admin(request):
    if not request.session.get("loggedout"):
        if request.session.get('name') is not None:
            if request.session.get('isAdmin'):
                template = loader.get_template("admin.html")
                username = {"_id": request.session.get('name')}
                email = {"email": request.session.get('name')}
                userinfo = utils.getUserinfoCollection().find_one({'$or': [username, email]})
                context = {
                    'name': userinfo["_id"]
                }
                return HttpResponse(template.render(context, request))
            else:
                messages.info(request, 'Access Denied!')
                return redirect('/user')
        else:
            return redirect('/account/login')
    else:
        return redirect('/account/login')
