from django.shortcuts import render, redirect

# Create your views here.
from django.shortcuts import render
from django.http import HttpResponse, FileResponse, JsonResponse
import json
import stripe
import io
from django.template import loader
from django.core.mail import send_mail, EmailMessage
from Utilities import utils
from django.conf import settings
from django.core import mail
from datetime import datetime
from threading import Timer, Event
import time
from datetime import date
import dateutil.parser
from xhtml2pdf import pisa

from django.conf import settings
from django.template.loader import get_template
from reportlab.rl_settings import defaultPageSize

stripe.api_key = 'sk_test_51MWiMkBuAZbM1te6b7Rb879QSfzfSVSpkfBlzaHl0S5hPQgked5U62K6Iqyfeai4h9PxjW9cY2Z8X40eDDr2k1y6006kbPOM1v'
BLOCK_MINUTES = 1
RELEASE_SEATS_MINUTES = 10
TIMER_INIT_SECONDS = 600

stop_event = Event()


def create_payment(request):
    try:
        if request.method != 'POST':
            raise Exception("Request method must be POST")
        # Create a PaymentIntent with the order amount and currency
        body_unicode = request.body.decode('UTF-8')
        body = json.loads(body_unicode)
        intent = createPaymentIntent(request, body)

        return HttpResponse(json.dumps({"clientSecret": intent['client_secret']}), content_type="application/json",
                            status=200)
    except Exception as e:
        print(str(e))
        return HttpResponse(json.dumps({"message": e}), content_type="application/json", status=403)


def createPaymentIntent(request, body):
    utils.specifyPaymentDetails(request, body)

    intent = stripe.PaymentIntent.create(
        amount=request.session['payment']['total'],
        currency='cad',
        automatic_payment_methods={
            'enabled': True,
        },
    )
    return intent


def specifyPaymentDetails(request, info):
    try:
        utils.specifyPaymentDetails(request, info)
        return JsonResponse({'status': True})
    except:
        return JsonResponse({'status': False})


def setSessionEmail(request):
    if request.method == 'POST':
        body_unicode = request.body.decode('UTF-8')
        body = json.loads(body_unicode)
        request.session['email'] = body['email']
        return HttpResponse(json.dumps({"message": ""}), content_type="application/json", status=200)


def setPaymentCounter(request):
    if request.method == 'POST':
        body_unicode = request.body.decode('UTF-8')
        body = json.loads(body_unicode)
        concert = body['concert']
        seats = body['seats']
        request.session['counter'] = body['counter']

        if paymentIsNotBlocked(request) and body['counter'] == 0:
            blockPayment(request)
        elif paymentIsNotBlocked(request) and body['counter'] == -1:
            blockPayment(request)
            releaseSeatsImmediatelly(concert, seats)

        return HttpResponse(json.dumps({'message': 'success'}), content_type="application/json",
                            status=200)


def releaseSeatsImmediatelly(concert, seats):
    stop_event.set()
    utils.ChangeConcertSeats(concert, seats, True)


def getPaymentCounter(request):
    if request.method == 'POST':
        response = {}
        body_unicode = request.body.decode('UTF-8')
        body = json.loads(body_unicode)
        request_seats = body['seats']
        concert = body['concert']
        sorted_seat_names = [seat['seatName'] for seat in request_seats]
        sorted_seat_names.sort()

        if isNewTransaction(request):
            request.session['counter'] = TIMER_INIT_SECONDS
            request.session['seats'] = sorted_seat_names
            response['counter'] = request.session['counter']
            blockSeats(concert, request_seats)
        else:
            if not paymentIsNotBlocked(request):
                tryUnlockingPayment(request)

            if paymentIsNotBlocked(request):
                request.session['counter'] = TIMER_INIT_SECONDS
                request.session['seats'] = sorted_seat_names
                response['counter'] = request.session['counter']
                blockSeats(concert, request_seats)
            else:
                response['counter'] = -1

        return HttpResponse(json.dumps(response), content_type="application/json",
                            status=200)


def isNewTransaction(request):
    return paymentIsNotBlocked(request) and request.session.get('seats', None) is None


def resetTransaction(request):
    request.session['payment_blocked'] = None
    request.session['seats'] = None


def paymentIsNotBlocked(request):
    return request.session.get('payment_blocked', None) is None


def tryUnlockingPayment(request):
    now = datetime.now()
    minutes_diff = int((now - datetime.fromisoformat(request.session.get('payment_blocked'))).total_seconds() / 60.0)
    if minutes_diff >= BLOCK_MINUTES:
        request.session['payment_blocked'] = None


def isSameTransaction(request, sorted_seat_names):
    session_seats = request.session['seats']
    return session_seats == sorted_seat_names


def isFirstTransaction(request):
    return request.session.get('seats', None) is None


def isDifferentTransaction(request, seats):
    return (request.session['seats'] == seats)


def releasingSeatsHandler(concert, seats):
    if not stop_event.is_set():
        utils.ChangeConcertSeats(concert, seats, True)
    stop_event.clear()


def makeSeatsVacantAfter(minutes, concert, seats):
    t = Timer(60 * minutes, lambda: releasingSeatsHandler(concert, seats))
    t.start()


def blockSeats(concert, seats):
    utils.ChangeConcertSeats(concert, seats, False)
    makeSeatsVacantAfter(RELEASE_SEATS_MINUTES, concert, seats)


def blockPayment(request):
    request.session['payment_blocked'] = datetime.now().isoformat()


def getAccountCard(request):
    credit_card_info = utils.getUserRequiredPaymentInfo(request)
    card_number = credit_card_info['cardNumber']
    exp_month = credit_card_info['month']
    exp_year = credit_card_info['year']
    cvc = credit_card_info['cvc']

    request.session['email'] = credit_card_info['email']

    payment_method = stripe.PaymentMethod.create(
        type="card",
        card={
            "number": card_number,
            "exp_month": exp_month,
            "exp_year": exp_year,
            "cvc": cvc,
        },
    )
    return payment_method

def confirmPaymentIntent(payment_intent, payment_method):
    payment_intent = stripe.PaymentIntent.confirm(
        payment_intent.id,
        payment_method=payment_method.id,
        return_url='http://127.0.0.1:8000/payment/lang/'
    )
    return payment_intent

def payUsingCardData(request):
    body_unicode = request.body.decode('UTF-8')
    body = json.loads(body_unicode)

    intent = createPaymentIntent(request, body)
    account_card = getAccountCard(request)
    payment_intent = confirmPaymentIntent(intent, account_card)

    if payment_intent.status != "succeeded":
        print('failed')
        return JsonResponse({'status': False})
    else:
        return JsonResponse({'status': True, 'redirect': 'http://127.0.0.1:8000/payment/submitted/'})


def pay(request, id):
    return render(request, 'pay.html')

def paymentDetails(request, id):
    return render(request, 'paymentInfo.html')


def pdf(request):
    return render(request, 'ticket_pdf.html')


def paymentSubmitted(request):
    try:
        if 'payment' in request.session:
            utils.ChangeConcertSeats(request.session['payment']['concert'], request.session['payment']['tickets'],
                                     False)
            resetTransaction(request)
            lang = request.GET['lang']

            sendConfirmationEmail(request.session, lang)

            # ADDED STUFF BY: CLEO
            if request.session.get('name') is not None:
                pay_date = str(date.today())
                concert = request.session['payment']['concert']
                tickets = request.session['payment']['tickets']
                user = request.session['name']

                utils.create_purchase_history(concert, tickets, user, pay_date)
            # end

            del request.session['payment']
            del request.session['email']

            message = 'Payment received. Confirmation sent to your email.'
        elif 'payment_status' in request.session and request.session['payment_status'] == 'sent':
            message = 'Payment received. Email already sent.'
        else:
            message = 'Either confirmation message was already sent to your email, or you did not pay.'

        template = loader.get_template('submitted.html')

        context = {
            'message': message
        }

        return HttpResponse(template.render(context, request))
    except Exception as e:
        print(str(e))
        return redirect('/')
    return HttpResponse(template.render(context, request))


def sendConfirmationEmail(session, lang):
        pdf = ticket_pdf(session, lang)
        email_from = settings.EMAIL_HOST_USER

        if lang == 'French':
            email_subject = 'Confirmation de paiement BeatSeeker'
            email_body = 'Ci-joint, vos billets de concert'
        else:
            email_subject = 'BeatSeeker payment confirmation'
            email_body = 'Attached are your concert tickets'

        email_to = [session['email']]
        email = EmailMessage(
            email_subject,
            email_body,
            email_from,
            email_to,
            reply_to=[email_from],
        )

        email.attach('ticket_{}.pdf'.format(int(time.time())), pdf.getvalue(), 'application/pdf')
        email.send(fail_silently=False)

        session['payment_status'] = 'sent'



def getDisplayedDate(date_obj, lang):
    months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]
    month = months[date_obj['month']]
    day = date_obj['day']
    year = date_obj['year']
    return f'{month} {day}, {year}'


def ticket_pdf(session, lang):
    template_path = 'ticket_pdf.html'
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'filename="tickets_{}.pdf"'.format(int(time.time()))
    template = get_template(template_path)

    concert_context = {
        'id': session['payment']['concert']['id'],
        'name': session['payment']['concert']['name'],
        'date': getDisplayedDate(session['payment']['concert']['date'], lang),
        'address': session['payment']['concert']['address']
    }
    context = {
        'concert': concert_context,
        'tickets': session['payment']['tickets']
    }

    if lang == 'French':
        context['confirmation_title'] = 'Confirmation des billets de concert'
        context['concert_label'] = 'Concert'
        context['date_label'] = 'Date'
        context['time_label'] = 'Heure'
        context['location_label'] = 'Lieu'
        context['seat'] = 'Siège'
    else:
        context['confirmation_title'] = 'Concert Tickets Confirmation'
        context['concert_label'] = 'Concert'
        context['date_label'] = 'Date'
        context['time_label'] = 'Time'
        context['location_label'] = 'Location'
        context['seat'] = 'Seat'

    html = template.render(context)
    pdf = pisa.CreatePDF(io.BytesIO(html.encode('UTF-8')), response)
    if not pdf.err:
        return response
    else:
        return HttpResponse('Error generating PDF file')


def lang(request):
    return render(request, 'pdf_lang.html')
