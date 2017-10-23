import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { RadioOption } from '../shared/radio/radio-option.model';
import { OrderService } from './order.service';
import { CartItem } from '../restaurant-details/shopping-cart/cart-item.model';
import { Order, OrderItem } from './order.model';

@Component({
  selector: 'mt-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
  numberPattern = /^[0-9]*$/;
  orderForm: FormGroup;
  paymentOptions: RadioOption[] = [
    {
      label: 'Dinheiro',
      value: 'din'
    },
    {
      label: 'Debito',
      value: 'deb'
    },
    {
      label: 'Credito',
      value: 'cre'
    }
  ];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  cartItems(): CartItem[] {
    return this.orderService.cartItems();
  }

  increaseQty(item: CartItem) {
    this.orderService.increaseQty(item);
  }

  decreaseQty(item: CartItem) {
    this.orderService.decreaseQty(item);
  }

  removeItem(item: CartItem) {
    this.orderService.removeItem(item);
  }

  total(): number {
    return this.orderService.total();
  }

  checkOrder(order: Order) {
    order.orderItems = this.cartItems().map(
      (i: CartItem) => new OrderItem(i.quantity, i.menuItem.id)
    );
    this.orderService.checkOrder(order).subscribe((orderId: string) => {
      this.router.navigate(['/order-success']);
      console.log('Compra concluída: ', orderId);
      this.orderService.clear();
    });
  }

  ngOnInit() {
    const { formBuilder, emailPattern, numberPattern } = this;
    const { control } = formBuilder;
    const { required, pattern, minLength } = Validators;

    this.orderForm = this.formBuilder.group(
      {
        name: control('', [required, minLength(5)]),
        email: control('', [required, pattern(emailPattern)]),
        emailConfirmation: control('', [required, pattern(emailPattern)]),
        address: control('', [required, minLength(5)]),
        number: control('', [required, pattern(numberPattern)]),
        optionalAddress: control(''),
        paymentOption: control('', [required])
      },
      { validator: equalsTo }
    );
  }
}

function equalsTo(group: AbstractControl): { [key: string]: boolean } {
  const email = group.get('email');
  const emailConfirmation = group.get('emailConfirmation');
  if (!email || !emailConfirmation) {
    return undefined;
  }
  if (email.value !== emailConfirmation.value) {
    return { emailNotMatch: true };
  }
  return undefined;
}
