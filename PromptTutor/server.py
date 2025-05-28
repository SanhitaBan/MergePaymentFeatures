import logging
import os

from flask import Flask, request, Response, send_from_directory
from flask_cors import CORS
from paypalserversdk.http.auth.o_auth_2 import ClientCredentialsAuthCredentials
from paypalserversdk.logging.configuration.api_logging_configuration import (
    LoggingConfiguration,
    RequestLoggingConfiguration,
    ResponseLoggingConfiguration,
)
from paypalserversdk.paypal_serversdk_client import PaypalServersdkClient
from paypalserversdk.controllers.orders_controller import OrdersController
from paypalserversdk.models.amount_with_breakdown import AmountWithBreakdown
from paypalserversdk.models.checkout_payment_intent import CheckoutPaymentIntent
from paypalserversdk.models.order_request import OrderRequest
from paypalserversdk.models.purchase_unit_request import PurchaseUnitRequest
from paypalserversdk.api_helper import ApiHelper

app = Flask(__name__, static_folder='.')
CORS(app)

# PayPal client configuration
paypal_client: PaypalServersdkClient = PaypalServersdkClient(
    client_credentials_auth_credentials=ClientCredentialsAuthCredentials(
        o_auth_client_id=os.getenv("PAYPAL_CLIENT_ID", "ATGzIcOUVISmjjL0i3EioKqTQdXRDuxuUXcsOiesCBg6lRYHoBY69-2TVGSrdwVlBSsGCz5t1dKixZE0"),
        o_auth_client_secret=os.getenv("PAYPAL_CLIENT_SECRET", "EBo5hWxqTtLXGJHRCCmX2UDEKJR9Fc7QNM-nOW_qR0UCOJBBcp81DdQbzdtT1HyX_GN0c1HKn5Qm80na"),
    ),
    logging_configuration=LoggingConfiguration(
        log_level=logging.INFO,
        mask_sensitive_headers=True,
        request_logging_config=RequestLoggingConfiguration(
            log_headers=True, log_body=True
        ),
        response_logging_config=ResponseLoggingConfiguration(
            log_headers=True, log_body=True
        ),
    ),
)

orders_controller: OrdersController = paypal_client.orders

@app.route("/", methods=["GET"])
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

@app.route("/api/orders", methods=["POST"])
def create_order():
    request_body = request.get_json()
    plan_type = request_body.get("plan_type", "basic")
    
    # Set amount based on plan type
    amount = "19.99" if plan_type == "pro" else "9.99"
    description = "Pro Plan Monthly Subscription" if plan_type == "pro" else "Basic Plan Monthly Subscription"
    
    order = orders_controller.create_order(
        {
            "body": OrderRequest(
                intent=CheckoutPaymentIntent.CAPTURE,
                purchase_units=[
                    PurchaseUnitRequest(
                        AmountWithBreakdown(currency_code="USD", value=amount),
                        description=description
                    )
                ],
            ),
            "prefer": "return=representation",
        }
    )
    return Response(
        ApiHelper.json_serialize(order.body), status=200, mimetype="application/json"
    )

@app.route("/api/orders/<order_id>/capture", methods=["POST"])
def capture_order(order_id):
    order = orders_controller.capture_order(
        {"id": order_id, "prefer": "return=representation"}
    )
    return Response(
        ApiHelper.json_serialize(order.body), status=200, mimetype="application/json"
    )

if __name__ == "__main__":
    port = int(os.getenv('FLASK_RUN_PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True) 